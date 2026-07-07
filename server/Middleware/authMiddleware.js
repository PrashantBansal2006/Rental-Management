import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import User from '../models/user.model.js'
dotenv.config()


const userAuth=async(req,res,next)=>{
    try{
        const token=req.cookies.token; 
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        if (decoded.id){
            req.userId=decoded.id;
        }
        else{
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        // ab yeh userId ko hum aage ke controllers me use kar sakte hai
        next();
    }
    catch(err){
        res.status(401).json({
            success: false,
            message: "Invalid or Expired Token",
            err
        })
    }
}


const adminAuth = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).select("role");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        if (user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }
        next();
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

export { userAuth , adminAuth }