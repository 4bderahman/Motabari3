import express from "express";
import { NewUsers } from "../models/newUsers.js";
import jwt from "jsonwebtoken";
import NeedBlood from "../models/needBlood.js";

const router = express.Router();

// Get hospital profile
router.get("/profile", async (req, res) => {
  try {
    const userId = req.user.id;
    const hospital = await NewUsers.findById(userId).select("-password -__v");

    if (!hospital) {
      return res.status(404).json({
        status: "error",
        message: "Hospital not found",
      });
    }

    res.json({
      status: "success",
      data: hospital,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Update hospital profile
router.put("/profile", async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, email, address, contactPerson } = req.body;

    const updatedHospital = await NewUsers.findByIdAndUpdate(
      userId,
      {
        $set: {
          name,
          phone,
          email,
          address,
          contactPerson,
        },
      },
      { new: true, runValidators: true }
    ).select("-password -__v");

    res.json({
      status: "success",
      data: updatedHospital,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

router.post("/request-blood", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const hospital = await NewUsers.findById(decoded.id);
    if (!hospital) {
      return res.status(404).json({
        status: "error",
        message: "Hospital not found",
      });
    }

    const newBloodRequest = new NeedBlood({
      userId: hospital._id,
      hospital: hospital.name,
      bloodType: req.body.bloodType,
      units: req.body.units,
      urgency: req.body.urgency || "normal",
      location: hospital.address,
      contactNumber: hospital.phone,
      status: "pending",
    });

    const savedRequest = await newBloodRequest.save();

    res.status(201).json({
      status: "success",
      data: savedRequest,
    });
  } catch (error) {
    console.error("Blood request error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

export default router;
