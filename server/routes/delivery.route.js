import express from "express"

const router = express.Router();

import { createReservation } from "../controllers/delivery.controller.js";
import { getDelivery } from "../controllers/getDelivery.controllers.js";

router.post("/reserve", createReservation);

router.get("/:deliveryId", getDelivery);



export default router;

