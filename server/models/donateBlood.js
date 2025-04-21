import mongoose from "mongoose";
const { Schema, model } = mongoose;

const donateBloodSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    bloodType: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    message: { type: String },
    donated: {
      type: Boolean,
      default: false,
    },
    donorId: {
      type: Schema.Types.ObjectId,
      ref: "NewUsers",
    },
    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const DonateBlood = model("DonateBlood", donateBloodSchema);

export default DonateBlood;
