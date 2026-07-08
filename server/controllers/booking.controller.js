import mongoose from "mongoose";
import { Booking } from "../models/booking.model.js";
import Product from "../models/productModel.js";
import { Rental } from "../models/rental.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { calculateRentalPrice } from "../services/pricing.service.js";
import { initiatePayment } from "../services/payment.service.js";
import { generateContractPDF } from "../services/contract.service.js";

export const createQuotation = async (req, res, next) => {
  try {
    const { productId, pickupDate, returnDate, quantity } = req.body;

    if (!productId || !pickupDate || !returnDate || !quantity) {
      throw new ApiError(
        400,
        "productId, pickupDate, returnDate and quantity are required"
      );
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new ApiError(400, "Invalid productId");
    }

    if (new Date(pickupDate) >= new Date(returnDate)) {
      throw new ApiError(400, "returnDate must be after pickupDate");
    }

    if (quantity <= 0) {
      throw new ApiError(400, "quantity must be greater than 0");
    }

    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    if (product.availableQuantity < quantity) {
      throw new ApiError(400, "Requested quantity not available");
    }

    const { rentalAmount, securityDeposit, totalAmount } =
      calculateRentalPrice(product, pickupDate, returnDate, quantity);

    const booking = await Booking.create({
      customer: req.userId,
      product: productId,
      pickupDate,
      returnDate,
      quantity,
      rentalAmount,
      securityDeposit,
      totalAmount,
      approvalStatus: "pending_admin_review",
      bookingStatus: "pending",
      stage: "quotation",
    });

    return res
      .status(201)
      .json(new ApiResponse(201, booking, "Quotation created successfully"));
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const { stage } = req.query;
    const filter = { customer: req.userId };

    if (stage) {
      filter.stage = stage;
    }

    const bookings = await Booking.find(filter)
      .populate("product")
      .sort({ createdAt: -1 });

    return res
      .status(200)
      .json(new ApiResponse(200, bookings, "Bookings fetched successfully"));
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid booking id");
    }

    const booking = await Booking.findById(id).populate("product");

    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    if (booking.customer.toString() !== req.userId.toString()) {
      throw new ApiError(403, "You are not authorized to view this booking");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, booking, "Booking fetched successfully"));
  } catch (error) {
    next(error);
  }
};

export const confirmBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid booking id");
    }

    const booking = await Booking.findById(id).session(session);
    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    if (booking.customer.toString() !== req.userId.toString()) {
      throw new ApiError(403, "You are not allowed to confirm this booking");
    }

    if (booking.stage !== "quotation") {
      throw new ApiError(
        400,
        `Booking cannot be confirmed from its current stage: ${booking.stage}`
      );
    }

    if (booking.approvalStatus === "pending_admin_review") {
      throw new ApiError(
        400,
        "Your request is still awaiting admin approval. You cannot confirm yet."
      );
    }

    if (booking.approvalStatus === "rejected") {
      throw new ApiError(
        400,
        "This booking request was rejected by admin and cannot be confirmed."
      );
    }

    const product = await Product.findById(booking.product).session(session);
    if (!product) {
      throw new ApiError(404, "Product no longer exists");
    }

    if (product.availableQuantity < booking.quantity) {
      throw new ApiError(
        400,
        "Product is no longer available in the requested quantity"
      );
    }

    product.availableQuantity -= booking.quantity;
    await product.save({ session });

    booking.bookingStatus = "confirmed";
    booking.stage = "order";
    await booking.save({ session });

    await session.commitTransaction();
    session.endSession();

    const populatedBooking = await Booking.findById(booking._id)
      .populate("customer", "name email")
      .populate("product", "name");

    const documentUrl = await generateContractPDF(populatedBooking);

    populatedBooking.contract.isGenerated = true;
    populatedBooking.contract.documentUrl = documentUrl;
    populatedBooking.contract.generatedAt = new Date();
    const savedBooking = await populatedBooking.save();

    const paymentInfo = await initiatePayment(savedBooking);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          booking: savedBooking,
          contractUrl: documentUrl,
          payment: paymentInfo,
        },
        "Booking confirmed, contract generated, payment initiated"
      )
    );
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid booking id");
    }

    const booking = await Booking.findById(id).session(session);
    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    if (booking.customer.toString() !== req.userId.toString()) {
      throw new ApiError(403, "You are not authorized to cancel this booking");
    }

    if (booking.stage === "completed" || booking.stage === "cancelled") {
      throw new ApiError(
        400,
        `Booking cannot be cancelled from stage: ${booking.stage}`
      );
    }

    if (booking.stage === "order") {
      const product = await Product.findById(booking.product).session(session);
      if (product) {
        product.availableQuantity += booking.quantity;
        await product.save({ session });
      }
    }

    booking.bookingStatus = "cancelled";
    booking.stage = "cancelled";
    if (booking.approvalStatus === "pending_admin_review") {
      booking.approvalStatus = "rejected";
      booking.adminReview.rejectionReason = "Cancelled by customer";
    }
    await booking.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res
      .status(200)
      .json(new ApiResponse(200, booking, "Booking cancelled successfully"));
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    next(error);
  }
};

export const getContractInfo = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid booking id");
    }

    const booking = await Booking.findById(id).select("contract customer");
    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    if (booking.customer.toString() !== req.userId.toString()) {
      throw new ApiError(
        403,
        "You are not authorized to view this contract info"
      );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, booking.contract, "Contract fetched successfully")
      );
  } catch (error) {
    next(error);
  }
};

export const getPendingApprovals = async (req, res, next) => {
  try {
    const pendingBookings = await Booking.find({
      approvalStatus: "pending_admin_review",
    })
      .populate("product")
      .populate("customer", "name email");

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          pendingBookings,
          "Pending approvals fetched successfully"
        )
      );
  } catch (error) {
    next(error);
  }
};

export const getAllBookingsForAdmin = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate("product")
      .populate("customer", "name email");

    return res
      .status(200)
      .json(
        new ApiResponse(200, bookings, "All bookings fetched successfully")
      );
  } catch (error) {
    next(error);
  }
};

export const approveBookingRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid booking id");
    }

    const booking = await Booking.findById(id)
      .populate("product")
      .populate("customer", "name email");

    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    if (booking.approvalStatus !== "pending_admin_review") {
      throw new ApiError(
        400,
        `This request has already been ${booking.approvalStatus}`
      );
    }

    const pdfUrl = await generateContractPDF(booking);

    booking.approvalStatus = "approved";
    booking.contract.isGenerated = true;
    booking.contract.documentUrl = pdfUrl;
    booking.contract.generatedAt = new Date();
    booking.adminReview.reviewedBy = req.userId;
    booking.adminReview.reviewedAt = new Date();
    await booking.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          booking,
          "Booking request approved and contract generated"
        )
      );
  } catch (error) {
    next(error);
  }
};

export const rejectBookingRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid booking id");
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    if (booking.approvalStatus !== "pending_admin_review") {
      throw new ApiError(
        400,
        `This request has already been ${booking.approvalStatus}`
      );
    }

    booking.approvalStatus = "rejected";
    booking.bookingStatus = "cancelled";
    booking.stage = "cancelled";
    booking.adminReview.reviewedBy = req.userId;
    booking.adminReview.reviewedAt = new Date();
    booking.adminReview.rejectionReason = reason || "Not specified";
    await booking.save();

    return res
      .status(200)
      .json(
        new ApiResponse(200, booking, "Booking request rejected successfully")
      );
  } catch (error) {
    next(error);
  }
};