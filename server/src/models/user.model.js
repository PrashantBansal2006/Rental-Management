import mongoose from "mongoose" 

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    phone: String,

    role: {
        type: String,
        enum: ["customer", "admin", "staff"],
        default: "customer"
    },

    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
    },

}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;