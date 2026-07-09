import {Notification} from "../models/notification.model.js";
import { NotificationPreference } from "../models/notificationPreference.model.js";

import sendEmail from "../services/emailService.js"; // yet to be created

import User from "../models/user.model.js";



export const sendNotification = async(req,res)=>{

    try{


        const {
            userId,
            title,
            message,
            type,
            channel,
            relatedId,
            relatedModel

        } = req.body;



        // Create notification

        const notification =
        await Notification.create({

            userId,

            title,

            message,

            type,

            channel,

            relatedId,

            relatedModel,

            status:"PENDING"

        });



        // Send email if channel is EMAIL

        if(channel === "EMAIL"){


            const user =
            await User.findById(userId);



            if(user && user.email){


                await sendEmail(

                    user.email,

                    title,

                    message

                );


                notification.status="SENT";

            }


        }
        else{


            notification.status="SENT";

        }



        await notification.save();



        res.status(201).json({

            success:true,

            message:
            "Notification sent successfully",

            notification

        });


    }
    catch(error){

        console.log("Error in sendNotification controller: ",error);
        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};


export const getUserNotifications = async(req,res)=>{

    try{

        const { userId } = req.params;


        const notifications = await Notification.find({

            userId:userId

        })
        .sort({

            createdAt:-1

        });



        res.status(200).json({

            success:true,

            count:notifications.length,

            notifications

        });


    }
    catch(error){

        console.log("Error in getUserNotifications controller: ",error);
        res.status(500).json({

            success:false,

            message:error.message

        });


    }

};


export const markNotificationRead = async(req,res)=>{

    try{
        const { notificationId } = req.params;


        const notification =
        await Notification.findById(
            notificationId
        );


        // Check notification exists

        if(!notification){

            return res.status(404).json({

                success:false,

                message:
                "Notification not found"

            });

        }



        // Update read status

        notification.isRead = true;


        await notification.save();



        res.status(200).json({

            success:true,

            message:
            "Notification marked as read",

            notification

        });


    }
    catch(error){

        console.log("Error in markNotificationRead controller: ",error);
        res.status(500).json({

            success:false,

            message:error.message

        });


    }

};


export const updateNotificationPreference =
async(req,res)=>{


    try{


        const { userId } = req.params;


        const {

            returnReminderDays,

            emailEnabled,

            inAppEnabled,

            smsEnabled,

            orderNotification,

            pickupNotification,

            returnNotification

        } = req.body;



        // Validate reminder days

        if(
            returnReminderDays &&
            returnReminderDays < 0
        ){

            return res.status(400).json({

                success:false,

                message:
                "Reminder days cannot be negative"

            });

        }



        const preference =
        await NotificationPreference.findOneAndUpdate(

            {
                userId:userId
            },


            {

                returnReminderDays,

                emailEnabled,

                inAppEnabled,

                smsEnabled,

                orderNotification,

                pickupNotification,

                returnNotification

            },


            {
                new:true,
                upsert:true
            }

        );



        res.status(200).json({
            success:true,

            message:
            "Notification preference updated successfully",

            preference

        });



    }
    catch(error){

        console.error("error in updateNotificationPreference controller",error);
        res.status(500).json({

            success:false,

            message:error.message

        });

    }

};


export const getNotificationPreference = async(req,res)=>{

    try{

        const { userId } = req.params;
        const preference = await NotificationPreference.findOne({userId:userId});



        if(!preference){

            return res.status(404).json({

                success:false,

                message:
                "Notification preference not found"

            });

        }



        res.status(200).json({

            success:true,

            preference

        });



    }
    catch(error){
        console.error("error in getNotificationPreference controller",error);
        res.status(500).json({
            success:false,
            message:error.message

        });

    }

};