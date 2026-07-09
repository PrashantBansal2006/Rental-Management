import mongoose from "mongoose"

const pickupSchema=new mongoose.Schema({

    deliveryId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Delivery"
    },

    employee:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

    pickupTime:Date,

    customerSignature:String,

    remarks:String

},{timestamps:true});

const PickupDocument=mongoose.model("PickupDocument",pickupSchema);

export default PickupDocument;