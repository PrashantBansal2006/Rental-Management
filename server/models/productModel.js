import mongoose, { Schema } from "mongoose";
import Category from "./categories.js";

const productSchema = new Schema({

    name: String,

    description: String,

    category: {
        type: Schema.Types.ObjectId,
        ref: "Category"
    },

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },

    images: [String],

    quantity: Number,

    availableQuantity: Number,

    securityDeposit: Number,

    status: {
        type: String,
        enum: [
            "available",
            "not Available"
        ],
        default: "available"
    },

    pricing: {
        hourly: Number,
        daily: Number,
        weekly: Number,
        monthly: Number,
        yearly: Number
    }

}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

export default Product;