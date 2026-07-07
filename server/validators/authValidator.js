import { body, validationResult } from "express-validator";

// Common validation result middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array(),
        });
    }

    next();
};

// Register
const registerValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 3 })
        .withMessage("Name must be at least 3 characters"),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Enter a valid email"),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),

    validate,
];

// Login
const loginValidator = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Enter a valid email"),

    body("password")
        .notEmpty()
        .withMessage("Password is required"),

    validate,
];

// Verify Email
const verifyEmailValidator = [
    body("otp")
        .trim()
        .notEmpty()
        .withMessage("OTP is required")
        .isLength({ min: 6, max: 6 })
        .withMessage("OTP must be 6 digits")
        .isNumeric()
        .withMessage("OTP must contain only numbers"),

    validate,
];

// Send Reset OTP
const sendResetOtpValidator = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Enter a valid email"),

    validate,
];

// Reset Password
const resetPasswordValidator = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Enter a valid email"),

    body("otp")
        .trim()
        .notEmpty()
        .withMessage("OTP is required")
        .isLength({ min: 6, max: 6 })
        .withMessage("OTP must be 6 digits")
        .isNumeric()
        .withMessage("OTP must contain only numbers"),

    body("newPassword")
        .notEmpty()
        .withMessage("New password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),

    validate,
];

export  {registerValidator,loginValidator,verifyEmailValidator,sendResetOtpValidator,resetPasswordValidator};