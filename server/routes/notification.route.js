import express from "express";
import {
    sendNotification,
    getUserNotifications,
    markNotificationRead,
    updateNotificationPreference,
    getNotificationPreference
} from "../controllers/notification.controller.js";
const router = express.Router();


router.post(
    "/send",
    sendNotification
);

router.get(
    "/user/:userId",
    getUserNotifications
);

router.patch(
    "/:notificationId/read",
    markNotificationRead
);

router.put(
    "/preferences/:userId",
    updateNotificationPreference
);

router.get(
    "/preferences/:userId",
    getNotificationPreference
);
export default router;