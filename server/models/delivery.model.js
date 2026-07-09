import mongoose from "mongoose"

const deliverySchema = new mongoose.Schema({

    orderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Order", // yet to be declared
        required:true
    },

    customerId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    productId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product",
        required:true
    },

    reservationDate:{
        type:Date,
        required:true
    },

    pickupDate:{
        type:Date
    },

    expectedReturnDate:{
        type:Date,
        required:true
    },

    actualReturnDate:{
        type:Date
    },

    status:{
        type:String,
        enum:[
            "Reserved",
            "ReadyForPickup",
            "PickedUp",
            "Returned",
            "Cancelled"
        ],
        default:"Reserved"
    },

    pickupAddress:String,

    returnAddress:String,

    notes:String

},{timestamps:true});

const Delivery = mongoose.model("Delivery",deliverySchema);

export default Delivery


