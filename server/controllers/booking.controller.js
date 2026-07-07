import mongoose from "mongoose";
import { Booking } from "../models/booking.model.js";
import Product from "../models/productModel.js";
import { Rental } from "../models/rental.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { calculateRentalPrice } from "../services/pricing.service.js"; // [MODULE 5]
import { initiatePayment } from "../services/payment.service.js"; // [MODULE 6]
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

    if (product.status !== "available") {
      throw new ApiError(400, "Product is currently not available for rent");
    }

    if (product.availableQuantity < quantity) {
      throw new ApiError(
        400,
        `Only ${product.availableQuantity} unit(s) available for this product`
      );
    }

    const { totalAmount, breakdown } = calculateRentalPrice(
      product,
      pickupDate,
      returnDate,
      quantity
    );

    const quotation = await Booking.create({
      customer: req.user._id,
      product: product._id,
      pickupDate,
      returnDate,
      quantity,
      totalAmount,
      securityDeposit: product.securityDeposit || 0,
      bookingStatus: "pending",
      stage: "quotation",
    });

    //Notify admin

    return res.status(201).json(
      new ApiResponse(
        201,
        { quotation, priceBreakdown: breakdown },
        "Booking request sent successfully. Waiting for admin approval."
      )
    );
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const filter = { customer: req.user._id };

    if (req.query.stage) {
      filter.stage = req.query.stage;
    }

    const bookings = await Booking.find(filter)
      .populate("product", "name images pricing")
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

    const booking = await Booking.findById(id)
      .populate("customer", "name email") 
      .populate("product", "name images pricing securityDeposit");

    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    if (
      req.user.role === "customer" &&
      booking.customer._id.toString() !== req.user._id.toString()
    ) {
      throw new ApiError(403, "You are not allowed to view this booking");
    }

    if (booking.approvalStatus === "pending_admin_review") {
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            _id: booking._id,
            approvalStatus: booking.approvalStatus,
            product: booking.product?.name,
            pickupDate: booking.pickupDate,
            returnDate: booking.returnDate,
          },
          "Your request is awaiting admin approval"
        )
      );
    }

    if (booking.approvalStatus === "rejected") {
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            _id: booking._id,
            approvalStatus: booking.approvalStatus,
            rejectionReason: booking.adminReview?.rejectionReason || null,
          },
          "Your booking request was rejected by admin"
        )
      );
    }

    let rentalInfo = null;
    if (booking.stage === "order" || booking.stage === "completed") {
      rentalInfo = await Rental.findOne({ booking: booking._id });
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        { booking, rental: rentalInfo },
        "Booking fetched successfully"
      )
    );
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

    if (booking.customer.toString() !== req.user._id.toString()) {
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

    booking.contract.isGenerated = true;
    booking.contract.documentUrl = documentUrl;
    booking.contract.generatedAt = new Date();
    await booking.save();

    const paymentInfo = await initiatePayment(booking);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          booking,
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

    if (booking.customer.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You are not allowed to cancel this booking");
    }

    if (booking.stage === "cancelled" || booking.stage === "completed") {
      throw new ApiError(
        400,
        `Booking is already in "${booking.stage}" stage, cannot cancel`
      );
    }

    if (booking.stage === "order") {
      const product = await Product.findById(booking.product).session(
        session
      );
      if (product) {
        product.availableQuantity += booking.quantity;
        await product.save({ session });
      }
    }

    booking.bookingStatus = "cancelled";
    booking.stage = "cancelled";
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

    const booking = await Booking.findById(id);

    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    if (booking.customer.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You are not allowed to view this contract");
    }

    if (!booking.contract.isGenerated) {
      throw new ApiError(
        400,
        "Contract has not been generated yet for this booking"
      );
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          documentUrl: booking.contract.documentUrl,
          generatedAt: booking.contract.generatedAt,
        },
        "Contract fetched successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

//END USER CONTROLLERS
export const getPendingApprovals = async (req, res, next) => {
  try {
    const pendingBookings = await Booking.find({
      approvalStatus: "pending_admin_review",
    })
      .populate("customer", "name email")
      .populate("product", "name")
      .sort({ createdAt: 1 }); 

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          pendingBookings,
          "Pending booking requests fetched successfully"
        )
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

    booking.approvalStatus = "approved";
    booking.adminReview.reviewedBy = req.user._id;
    booking.adminReview.reviewedAt = new Date();
    await booking.save();

    return res
      .status(200)
      .json(new ApiResponse(200, booking, "Booking request approved"));
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
    booking.adminReview.reviewedBy = req.user._id;
    booking.adminReview.reviewedAt = new Date();
    booking.adminReview.rejectionReason = reason || "Not specified";
    await booking.save();

    // notify customer

    return res
      .status(200)
      .json(new ApiResponse(200, booking, "Booking request rejected"));
  } catch (error) {
    next(error);
  }
};
