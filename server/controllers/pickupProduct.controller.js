import Delivery from "../models/delivery.model.js";
import Product from "../models/product.model.js";
import PickupDocument from "../models/pickup.model.js";

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

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};