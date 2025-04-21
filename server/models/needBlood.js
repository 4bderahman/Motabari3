import mongoose from "mongoose";
const { Schema, model } = mongoose;

// Need Blood schema and model
const NeedBloodSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "NewUsers",
      required: true,
    },
    patientName: {
      type: String,
      required: true,
    },
    bloodType: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    units: {
      type: Number,
      required: true,
      min: 1,
    },
    urgency: {
      type: String,
      enum: ["urgent", "normal"],
      default: "normal",
    },
    hospital: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "fulfilled", "cancelled"],
      default: "pending",
    },
    notes: {
      type: String,
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);
const NeedBlood = model("NeedBlood", NeedBloodSchema);

export default NeedBlood;
