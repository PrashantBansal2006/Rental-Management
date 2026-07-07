import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name: {type: String,required: true},
    email: {type: String,required: true,unique: true},
    password: {type: String,required: true},
    phone: {String,default:null},
    role: {type: String,
        enum: ["customer", "staff"],
        default: "customer"
    },
    address: {
        type: [{
            street: String,
            city: String,
            state: String,
            country: String,
            zipCode: String,
        }],
        default: [],
    },
    verifyOtp :{ type : String , default :''},
    verifyOtpExpireAt :{ type : Number , default : 0 },
    isAccountVerified :{ type : Boolean , default : false },
    resetOtp :{ type : String , default : '' },
    resetOtpExpireAt :{ type : Number , default : 0 },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;