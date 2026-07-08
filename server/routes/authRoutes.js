import { Router } from "express";
import { loginValidator, registerValidator, resetPasswordValidator, sendResetOtpValidator, verifyEmailValidator } from "../validators/authValidator.js";
import { isAuthenticated, login, logout, register, resetPassword, sendResetOTP, sendVerifyOTP, verifyEmail } from "../controllers/authController.js";
import { userAuth } from "../Middleware/authMiddleware.js";
const router = Router();

// Add auth routes here later
router.get("/", (req, res) => {
  res.send("Auth route");
});
router.post('/register', registerValidator ,register)
router.post('/login', loginValidator, login)
router.post('/logout',logout)
router.post('/send-verify-otp' , userAuth, sendVerifyOTP)
router.post('/verify-account', userAuth , verifyEmailValidator , verifyEmail)
router.post('/is-auth',userAuth , isAuthenticated)
router.post('/send-reset-otp',sendResetOtpValidator,sendResetOTP)
router.post('/reset-password',resetPasswordValidator,resetPassword)

export default router;
