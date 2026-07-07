import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'
import dotenv from 'dotenv'
import transporter from '../services/nodemailer.js'
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from '../config/Email_template.js'
dotenv.config()

async function register(req, res) {
    const { name, email, password ,phone ,  role ,address , } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ 
            success: false,
            message: "Missing Details" });
    }

    try{
        const userExists = await User.findOne({ email: email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: name,
            email: email,
            phone,
            role,
            address,
            password: hashedPassword
        });
        await newUser.save();
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7*24*60*60*1000 // 7 days
        });

        // Sending Welcome Email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: newUser.email,
            subject: 'Welcome to Our App',
            text: `Hello ${newUser.name},\n\nWelcome to our app! We're excited to have you on board.\n\nBest regards,\nThe Team`
        };

        await transporter.sendMail(mailOptions);

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            UserData :[
                newUser.name,
                newUser.email,
                newUser.phone,
                newUser.role,
                newUser.address
            ],
            token : token
        });
    }
    catch(err){ 
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            err
        })
    }
}

async function login(req, res) { 
    const { email, password } = req.body; 
    if (!email || !password) {
        return res.status(400).json({ 
            success: false,
            message: "Missing Details" });
    }
    try{
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid password"
            });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7*24*60*60*1000 // 7 days
        });
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token : token,
            userData :[
                user.name,
                user.email,
                user.phone,
                user.role,
                user.address
            ]
        }); 
    }
    catch(err){
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            err
        })
    }

}

async function logout(req, res) {
    try{
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        });
        res.status(200).json({
            success: true,
            message: "User logged out successfully"
        });
    }
    catch(err){
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

async function isAuthenticated(req, res) {
    try{
        return res.status(200).json({
            success : true,
            message : "User is Authenticated"
        })
    }
    catch(err){
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            err
        })
    }
}

const sendVerifyOTP = async (req, res) => {
    try{
        const  userId  = req.userId;
        console.log(userId);
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        if (user.isAccountVerified) {
            return res.status(400).json({
                success: false,
                message: "Account already verified"
            });
        }
        const otp=String(Math.floor(100000 + Math.random() * 900000));
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
        await user.save();
        // Here you would typically send the OTP via email or SMS
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Verify your email address",
            // text: `Your OTP for email verification is: ${otp}`,
            html : EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",otp).replace( "{{email}}",user.email )
        };
        // Send the email (implement your email sending logic here)
        await transporter.sendMail(mailOptions);
        return res.status(200).json({
            success: true,
            message: "Verification OTP sent successfully on Email"
        });
    }
    catch(err){
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error : err.message
        })
    }
}

const verifyEmail = async (req, res) => {
    try{
        const { otp } = req.body;
        const userId = req.userId;
        if (!otp) {
            return res.status(400).json({
                success: false,
                message: "OTP is required"
            });
     }   
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.verifyOtp==='' || user.verifyOtp!==otp){
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }
        // Lets suppose otp is correct and now we will check for expiry
        if (user.verifyOtpExpireAt < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired"
            });
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;
        await user.save();
        return res.status(200).json({
            success: true,
            message: "Email verified successfully"
        });
    }
    catch(err){
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message
        })
    }
}

async function sendResetOTP(req, res) {
    try{
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const otp=String(Math.floor(100000 + Math.random() * 900000));
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
        // isko bhi database me save karna hoga taki hum verify kar sake ki otp valid hai ya nahi
        await user.save();
        // Here you would typically send the OTP via email or SMS
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Password Reset OTP",
            // text: `Your OTP for password reset is: ${otp}`
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}}",user.email)
        };
        // Send the email (implement your email sending logic here)
        await transporter.sendMail(mailOptions);
        return res.status(200).json({
            success: true,
            message: "Password reset OTP sent successfully on Email"
        });
    }
    catch(err){
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message
        })
    }
}

async function resetPassword(req, res) {
    try{
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Missing Details"
            });
        }
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        if (user.resetOtp==='' || user.resetOtp!==otp){
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }
        if (user.resetOtpExpireAt < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired"
            });
        }
        // Update the user's password
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;        
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;
        await user.save();
        return res.status(200).json({
            success: true,
            message: "Password has been reset successfully"
        });
    }
    catch(err){
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message
        })
    }
}

export { register,login,logout, isAuthenticated, sendVerifyOTP, verifyEmail, sendResetOTP, resetPassword }