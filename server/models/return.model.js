import mongoose from "mongoose";

const returnSchema=new mongoose.Schema({

    deliveryId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Delivery"
    },

    employee:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Staff"
    },

    returnTime:Date,

    condition:{
        type:String,
        enum:[
            "Excellent",
            "Good",
            "Damaged"
        ]
    },

    damageDescription:String,

    remarks:String

},{timestamps:true});

const ReturnDocument=mongoose.model("ReturnDocument",returnSchema);

export default ReturnDocument;