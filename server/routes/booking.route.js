import { Router } from "express";
import { verifyJWT } from "../Middleware/authMiddleware.js";
import { authorizeRoles } from "../Middleware/roleMiddleware.js";
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
  authorizeRoles("staff"),
  getPendingApprovals
);

router.patch(
  "/admin/:id/approve",
  authorizeRoles("staff"),
  approveBookingRequest
);

router.patch(
  "/admin/:id/reject",
  authorizeRoles("staff"),
  rejectBookingRequest
);

export default router;
