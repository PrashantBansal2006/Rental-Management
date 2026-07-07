import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema({

    name: {
        type: String,
        required: true,
        unique: true
    },

    description: String,

    image: String

}, { timestamps: true });

const Category = mongoose.model("Category", categorySchema);

export default Category;