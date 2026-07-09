import express from "express"

const router = express.Router();

import {
    createReservation,
    getDelivery,
    pickupProduct,
    returnProduct,
    cancelReservation,
    getAllDeliveries,
    updatePickupTime,
    updateReturnTime,
    getPickupDocument,
    getReturnDocument,
    updateDeliveryStatus
} from "../controllers/delivery.controller.js";

router.post("/reserve", createReservation);

router.get("/:deliveryId", getDelivery);

router.post("/api/delivery/:id/pickup", pickupProduct);

router.post("/api/delivery/:id/return", returnProduct);

router.patch("/:deliveryId/cancel", cancelReservation);

router.get("/", getAllDeliveries);

router.patch("/:deliveryId/pickuptime", updatePickupTime);

router.patch("/:deliveryId/returntime", updateReturnTime);

router.get("/:deliveryId/pickup-document", getPickupDocument);

router.get("/:deliveryId/return-document", getReturnDocument);

router.patch("/:deliveryId/status", updateDeliveryStatus);

router.get("/customer/:customerId/deliveries", getCustomerDeliveries);
export default router;

