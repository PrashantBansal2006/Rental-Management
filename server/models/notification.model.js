import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },


    title:{
        type:String,
        required:true
    },


    message:{
        type:String,
        required:true
    },


    type:{
        type:String,
        enum:[
            "ORDER",
            "PICKUP",
            "RETURN",
            "PAYMENT",
            "REMINDER",
            "SYSTEM"
        ]
    },


    channel:{
        type:String,
        enum:[
            "EMAIL",
            "IN_APP",
            "SMS"
        ]
    },


    status:{
        type:String,
        enum:[
            "SENT",
            "FAILED",
            "PENDING"
        ],
        default:"PENDING"
    },


    isRead:{
        type:Boolean,
        default:false
    },


    relatedId:{
        type:mongoose.Schema.Types.ObjectId
    }


},
{
    timestamps:true
});


export const Notification = mongoose.model(
"Notification",
notificationSchema
);