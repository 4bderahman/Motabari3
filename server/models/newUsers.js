import mongoose from "mongoose";
import bcrypt from "bcrypt";

const newUsersSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, required: true, enum: ["donor", "hospital"] },
  date: { type: Date, default: Date.now },
  source: { type: String, required: true },
  // Donor specific fields
  age: {
    type: Number,
    required: function () {
      return this.userType === "donor";
    },
  },
  bloodType: {
    type: String,
    required: function () {
      return this.userType === "donor";
    },
  },
  // Hospital specific fields
  address: {
    type: String,
    required: function () {
      return this.userType === "hospital";
    },
  },
  contactPerson: {
    type: String,
    required: function () {
      return this.userType === "hospital";
    },
  },
  checked: {
    type: Number,
    default: 0,
  },
  donationHistory: [
    {
      donationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Donation",
      },
      date: Date,
      bloodType: String,
      status: {
        type: String,
        enum: ["pending", "approved", "completed"],
        default: "pending",
      },
    },
  ],
  lastDonation: Date,
  donations: [
    {
      date: {
        type: Date,
        required: true,
      },
      units: {
        type: Number,
        required: true,
      },
      location: String,
      status: {
        type: String,
        enum: ["pending", "completed", "cancelled"],
        default: "completed",
      },
    },
  ],
  resetToken: String,
  resetTokenExpiry: Date,
});

// Hash password before saving
newUsersSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

export const NewUsers = mongoose.model("NewUsers", newUsersSchema);
