import express from "express";
import { NeedBlood } from "../models/needBlood.js";
import { authMiddleware } from "../middleware/auth.js";
import { NewUsers } from "../models/newUsers.js";

const router = express.Router();

// Apply auth middleware
router.use(authMiddleware);

// Create blood request
router.post("/create", async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await NewUsers.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const newRequest = new NeedBlood({
      userId: user._id,
      patientName: req.body.patientName,
      bloodType: req.body.bloodType,
      units: req.body.units,
      urgency: req.body.urgency,
      hospital: req.body.hospital,
      location: req.body.location,
      contactNumber: req.body.contactNumber,
      notes: req.body.notes,
    });

    await newRequest.save();

    res.status(201).json({
      status: "success",
      data: newRequest,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Get all blood requests (admin only)
router.get("/all", async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Admin access required",
      });
    }

    const requests = await NeedBlood.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      status: "success",
      data: requests,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Get user's requests
router.get("/my-requests", async (req, res) => {
  try {
    const requests = await NeedBlood.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.json({
      status: "success",
      data: requests,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Update request status
router.patch("/:requestId/status", async (req, res) => {
  try {
    const request = await NeedBlood.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({
        status: "error",
        message: "Request not found",
      });
    }

    // Only admin or request owner can update status
    if (
      req.user.userType !== "admin" &&
      request.userId.toString() !== req.user.id
    ) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to update this request",
      });
    }

    request.status = req.body.status;
    await request.save();

    res.json({
      status: "success",
      data: request,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

export default router;
