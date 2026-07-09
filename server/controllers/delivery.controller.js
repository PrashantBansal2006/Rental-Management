import Delivery from "../models/delivery.model.js";
import Product from "../models/productModel.js";
import PickupDocument from "../models/pickup.model.js";
import ReturnDocument from "../models/return.model.js";

export const createReservation = async (req, res) => {

    try {

        const {

            orderId,
            customerId,
            productId,
            reservationDate,
            expectedPickupDate,
            expectedReturnDate,
            pickupAddress,
            returnAddress

        } = req.body;

        // Check product

        const product = await Product.findById(productId);

        if (!product) {

            return res.status(404).json({
                success: false,
                message: "Product not found"
            });

        }

        // Stock check

        if (product.availableQuantity <= 0) {

            return res.status(400).json({
                success: false,
                message: "Product unavailable"
            });

        }

        // Prevent duplicate reservation

        const existingReservation = await Delivery.findOne({

            orderId,
            status: {

                $in: ["Reserved", "ReadyForPickup", "PickedUp"]

            }

        });

        if (existingReservation) {

            return res.status(400).json({

                success: false,
                message: "Reservation already exists"

            });

        }

        // Create reservation

        const delivery = await Delivery.create({

            orderId,
            customerId,
            productId,
            reservationDate,
            pickupDate: expectedPickupDate,
            expectedReturnDate,
            pickupAddress,
            returnAddress,
            status: "Reserved"

        });

        // Update stock

        product.availableQuantity--;

        await product.save();

        res.status(201).json({

            success: true,

            message: "Reservation created successfully",

            delivery

        });

    }

    catch (err) {
        console.error("Error in createReservation controller", err);
        res.status(500).json({

            success: false,
            message: err.message

        });

    }

}


export const getDelivery = async (req, res) => {
    try {

        const delivery = await Delivery.findById(req.params.deliveryId)
            .populate("orderId")
            .populate("customerId", "-password")
            .populate("productId");

        if (!delivery) {
            return res.status(404).json({
                success: false,
                message: "Delivery not found"
            });
        }

        res.status(200).json({
            success: true,
            delivery
        });

    } catch (err) {
        console.error("Error in getDelivery controller", err);
        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

export const pickupProduct = async (req, res) => {

    try {

        const delivery = await Delivery.findById(req.params.deliveryId);

        if (!delivery) {
            return res.status(404).json({
                success: false,
                message: "Delivery not found"
            });
        }

        if (delivery.status !== "Reserved") {
            return res.status(400).json({
                success: false,
                message: "Product is not reserved"
            });
        }

        delivery.status = "PickedUp";
        delivery.pickupDate = new Date();

        await delivery.save();

        const product = await Product.findById(delivery.productId);

        await product.save();

        const pickupDoc = await PickupDocument.create({

            deliveryId: delivery._id,

            employee: req.body.employee,

            pickupTime: new Date(),

            customerSignature: req.body.customerSignature,

            remarks: req.body.remarks

        });

        res.status(200).json({

            success: true,

            message: "Pickup completed successfully",

            pickupDocument: pickupDoc

        });

    } catch (err) {
        console.error("Error in pickupProduct controller", err);
        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};


export const returnProduct = async (req, res) => {

    try {

        const {
            employee,
            condition,
            damageDescription,
            remarks

        } = req.body;



        // Find delivery

        const delivery = await Delivery.findById(
            req.params.deliveryId
        );


        if (!delivery) {

            return res.status(404).json({

                success: false,

                message: "Delivery not found"

            });

        }



        // Check product status

        if (delivery.status !== "PickedUp") {

            return res.status(400).json({

                success: false,

                message:
                    "Product has not been picked up yet"

            });

        }



        // Update delivery status

        delivery.status = "Returned";

        delivery.actualReturnDate = new Date();


        await delivery.save();




        // Update inventory

        const product = await Product.findById(
            delivery.productId
        );


        if (product) {

            product.availableQuantity++;
            await product.save();

        }




        // Create return document

        const returnDocument =
            await ReturnDocument.create({

                deliveryId: delivery._id,

                employee,

                condition,

                damageDescription,

                remarks,

                returnTime: new Date()

            });



        res.status(200).json({

            success: true,

            message:
                "Product returned successfully",

            returnDocument

        });



    }
    catch (error) {
        console.error("Error in returnProduct controller", error);
        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

export const cancelReservation = async (req, res) => {

    try {

        // Find delivery reservation

        const delivery = await Delivery.findById(
            req.params.deliveryId
        );


        if (!delivery) {

            return res.status(404).json({

                success: false,

                message: "Reservation not found"

            });

        }



        // Check reservation status

        if (delivery.status !== "Reserved") {

            return res.status(400).json({

                success: false,

                message:
                    "Reservation cannot be cancelled"

            });

        }



        // Update delivery status

        delivery.status = "Cancelled";


        await delivery.save();



        // Update product inventory

        const product = await Product.findById(
            delivery.productId
        );


        if (product) {

            product.reservedQuantity--;

            product.availableQuantity++;


            await product.save();

        }



        res.status(200).json({

            success: true,

            message:
                "Reservation cancelled successfully",

            delivery

        });



    }
    catch (error) {
        console.error("Error in cancelReservation controller", error);
        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

export const getAllDeliveries = async (req, res) => {

    try {

        const deliveries = await Delivery.find()

            .populate("orderId")

            .populate("customerId", "-password")

            .populate("productId")

            .sort({
                createdAt: -1
            });


        res.status(200).json({

            success: true,

            count: deliveries.length,

            deliveries

        });


    } catch (error) {
        console.error("Error in getAllDeliveries controller", error);

        res.status(500).json({

            success: false,

            message: error.message

        });


    }

};


export const updatePickupTime = async (req, res) => {

    try {

        const { expectedPickupDate } = req.body;


        // Find delivery

        const delivery = await Delivery.findById(
            req.params.deliveryId
        );


        if (!delivery) {

            return res.status(404).json({

                success: false,

                message: "Delivery not found"

            });

        }



        // Check status

        if (
            delivery.status === "PickedUp" ||
            delivery.status === "Returned" ||
            delivery.status === "Cancelled"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Pickup time cannot be updated"

            });

        }



        // Validate new pickup date

        if (new Date(expectedPickupDate) < new Date()) {

            return res.status(400).json({

                success: false,

                message:
                    "Pickup date cannot be in the past"

            });

        }



        // Update pickup time

        delivery.expectedPickupDate = expectedPickupDate;


        await delivery.save();



        res.status(200).json({

            success: true,

            message:
                "Pickup time updated successfully",

            delivery

        });


    }
    catch (error) {
        console.error("Error in updatePickupTime controller", error);
        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

export const updateReturnTime = async (req, res) => {

    try {

        const { expectedReturnDate } = req.body;


        // Find delivery

        const delivery = await Delivery.findById(
            req.params.deliveryId
        );


        if (!delivery) {

            return res.status(404).json({

                success: false,

                message: "Delivery not found"

            });

        }



        // Check current status

        if (
            delivery.status === "Returned" ||
            delivery.status === "Cancelled"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Return time cannot be updated"

            });

        }



        // Validate return date

        if (
            new Date(expectedReturnDate) <=
            new Date(delivery.expectedPickupDate)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Return date must be after pickup date"

            });

        }



        // Update return time

        delivery.expectedReturnDate = expectedReturnDate;


        await delivery.save();



        res.status(200).json({

            success: true,

            message:
                "Return time updated successfully",

            delivery

        });


    }
    catch (error) {
        console.error("Error in updateReturnTime controller", error);
        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

export const getPickupDocument = async (req, res) => {

    try {


        const pickupDocument =
            await PickupDocument.findOne({

                deliveryId: req.params.deliveryId

            })
                .populate({

                    path: "deliveryId",

                    populate: [
                        {
                            path: "customerId",
                            select: "name email phone"
                        },
                        {
                            path: "productId",
                            select: "name category pricing"
                        }
                    ]

                })
                .populate(
                    "employee",
                    "name email"
                );



        if (!pickupDocument) {

            return res.status(404).json({

                success: false,

                message:
                    "Pickup document not found"

            });

        }



        res.status(200).json({

            success: true,

            pickupDocument

        });


    }
    catch (error) {
        console.error("Error in getPickupDocument controller", error);

        res.status(500).json({

            success: false,

            message: error.message

        });


    }

};


export const getReturnDocument = async (req, res) => {

    try {


        const returnDocument =
            await ReturnDocument.findOne({

                deliveryId: req.params.deliveryId

            })
                .populate({

                    path: "deliveryId",

                    populate: [
                        {
                            path: "customerId",
                            select: "name email phone"
                        },

                        {
                            path: "productId",
                            select: "name category price"
                        },

                        {
                            path: "orderId",
                            select: "orderNumber"
                        }
                    ]

                })
                .populate(
                    "employee",
                    "name email"
                );



        if (!returnDocument) {

            return res.status(404).json({

                success: false,

                message:
                    "Return document not found"

            });

        }



        res.status(200).json({

            success: true,

            returnDocument

        });


    }
    catch (error) {
        console.error("Error in getReturnDocument controller", error);

        res.status(500).json({

            success: false,

            message: error.message

        });


    }

};


export const updateDeliveryStatus = async (req, res) => {

    try {

        const { status } = req.body;


        // Find delivery

        const delivery = await Delivery.findById(
            req.params.deliveryId
        );


        if (!delivery) {

            return res.status(404).json({

                success: false,

                message: "Delivery not found"

            });

        }



        // Allowed statuses

        const allowedStatus = [

            "Reserved",
            "ReadyForPickup",
            "PickedUp",
            "Returned",
            "Cancelled"

        ];



        // Validate status

        if (!allowedStatus.includes(status)) {

            return res.status(400).json({

                success: false,

                message: "Invalid delivery status"

            });

        }



        // Update status

        delivery.status = status;


        await delivery.save();



        res.status(200).json({

            success: true,

            message:
                "Delivery status updated successfully",

            delivery

        });


    }
    catch (error) {
        console.error("Error in updateDeliveryStatus controller", error);
        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};