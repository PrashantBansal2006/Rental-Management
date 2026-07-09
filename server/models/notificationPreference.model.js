import mongoose from "mongoose";

const preferenceSchema=new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },


    returnReminderDays:{
        type:Number,
        default:2
    },


    emailEnabled:{
        type:Boolean,
        default:true
    },


    inAppEnabled:{
        type:Boolean,
        default:true
    },


    smsEnabled:{
        type:Boolean,
        default:false
    }


},
{
timestamps:true
});


export const NotificationPreference =
mongoose.model(
"NotificationPreference",
preferenceSchema
);