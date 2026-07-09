import mongoose from "mongoose";

const emailLogSchema=new mongoose.Schema({

    receiver:{
        type:String
    },


    subject:{
        type:String
    },


    message:{
        type:String
    },


    status:{
        type:String,
        enum:[
            "SENT",
            "FAILED"
        ]
    },


    sentAt:{
        type:Date
    }

});


export const EmailLog = mongoose.model(
"EmailLog",
emailLogSchema
);