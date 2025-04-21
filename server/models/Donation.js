import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NewUsers",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    bloodType: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    date: {
      type: Date,
      required: true,
    },
    units: {
      type: Number,
      default: 450, // Standard donation amount in ml
    },
    status: {
      type: String,
      enum: ["not_yet", "donated"],
      default: "not_yet",
    },
    message: String,
  },
  { timestamps: true }
);

export const Donation = mongoose.model("Donation", donationSchema);
