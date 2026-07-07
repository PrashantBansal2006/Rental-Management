import mongoose,{ Schema } from "mongoose";

const bookingSchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    pickupDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    securityDeposit: {
      type: Number,
      default: 0,
    },
    bookingStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    stage: {
      type: String,
      enum: ["quotation", "order", "cancelled", "completed"],
      default: "quotation",
    },
    approvalStatus: {
      type: String,
      enum: ["pending_admin_review", "approved", "rejected"],
      default: "pending_admin_review",
    },
    adminReview: {
      reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      reviewedAt: {
        type: Date,
        default: null,
      },
      rejectionReason: {
        type: String,
        default: null,
      },
    },
    contract: {
      isGenerated: {
        type: Boolean,
        default: false,
      },
      documentUrl: {
        type: String,
        default: null,
      },
      generatedAt: {
        type: Date,
        default: null,
      },
    },
    payment: {
      status: {
        type: String,
        enum: ["not_initiated", "partial", "paid", "refunded"],
        default: "not_initiated",
      },
      amountPaid: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

export const Booking = mongoose.model("Booking", bookingSchema);
