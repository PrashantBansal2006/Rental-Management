import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import {
  createQuotation,
  getMyBookings,
  getBookingById,
  confirmBooking,
  cancelBooking,
  getContractInfo,
  getPendingApprovals,
  approveBookingRequest,
  rejectBookingRequest,
} from "../controllers/booking.controller.js";

const router = Router();

router.use(verifyJWT);

router.post("/quotation", createQuotation);
router.get("/myBookings", getMyBookings);
router.get("/:id", getBookingById);

router.patch("/:id/confirm", confirmBooking);
router.patch("/:id/cancel", cancelBooking);

router.get("/:id/contract", getContractInfo);

router.get(
  "/admin/pending",
  authorizeRoles("end_user"),
  getPendingApprovals
);

router.patch(
  "/admin/:id/approve",
  authorizeRoles("end_user"),
  approveBookingRequest
);

router.patch(
  "/admin/:id/reject",
  authorizeRoles("end_user"),
  rejectBookingRequest
);

export default router;
