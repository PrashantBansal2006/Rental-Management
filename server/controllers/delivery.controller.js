import Delivery from "../models/delivery.model.js";
import Product from "../models/product.model.js";

export const createReservation = async (req, res) => {

    try{

        const{

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

        if(!product){

            return res.status(404).json({
                success:false,
                message:"Product not found"
            });

        }

        // Stock check

        if(product.availableQuantity<=0){

            return res.status(400).json({
                success:false,
                message:"Product unavailable"
            });

        }

        // Prevent duplicate reservation

        const existingReservation = await Delivery.findOne({

            orderId,
            status:{

                $in:["Reserved","ReadyForPickup","PickedUp"]

            }

        });

        if(existingReservation){

            return res.status(400).json({

                success:false,
                message:"Reservation already exists"

            });

        }

        // Create reservation

        const delivery = await Delivery.create({

            orderId,
            customerId,
            productId,
            reservationDate,
            pickupDate:expectedPickupDate,
            expectedReturnDate,
            pickupAddress,
            returnAddress,
            status:"Reserved"

        });

        // Update stock

        product.availableQuantity--;

        await product.save();

        res.status(201).json({

            success:true,

            message:"Reservation created successfully",

            delivery

        });

    }

    catch(err){
        console.error("Error in createReservation controller", err);
        res.status(500).json({
            
            success:false,
            message:err.message

        });

    }

}