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

    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],

    cart: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            default: 1
        },
        duration: {
            type: Number,
            required: true
        },
        durationType: {
            type: String,
            enum: ['hourly', 'daily', 'weekly', 'monthly'],
            required: true
        },
        totalPrice: {
            type: Number,
            required: true
        }
    }]
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;