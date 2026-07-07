import Delivery from "../models/delivery.model.js";

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

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};