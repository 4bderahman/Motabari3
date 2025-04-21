import mongoose from "mongoose";

const qrCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NewUsers",
    required: true,
  },
  data: {
    type: String,
    required: true,
  },
  expiry: {
    type: Date,
    required: true,
    default: () => new Date(+new Date() + 24 * 60 * 60 * 1000), // 24 hours from creation
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const QRCode = mongoose.model("QRCode", qrCodeSchema);
