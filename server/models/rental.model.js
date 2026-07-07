import mongoose, { Schema } from "mongoose";

const rentalSchema = new Schema({
  booking: {
    type: Schema.Types.ObjectId,
    ref: "Booking",
  },
  // Add actual rental schema fields here later
}, { timestamps: true });

export const Rental = mongoose.model("Rental", rentalSchema);
