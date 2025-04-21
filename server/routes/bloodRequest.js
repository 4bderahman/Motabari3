import express from "express";
import { BloodRequest } from "../models/bloodRequest.js";
import { authMiddleware } from "../middleware/auth.js";
import { NewUsers } from "../models/newUsers.js";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";

const router = express.Router();

// Apply auth middleware
router.use(authMiddleware);

// Create blood request
router.post("/create", async (req, res) => {
  try {
    const userId = req.user.id;
    const hospital = await NewUsers.findById(userId);

    if (!hospital) {
      return res.status(404).json({
        status: "error",
        message: "Hospital not found",
      });
    }

    const newRequest = new BloodRequest({
      hospitalId: hospital._id,
      hospitalName: hospital.name,
      bloodType: req.body.bloodType,
      units: req.body.units,
      urgency: req.body.urgency || "normal",
      status: "pending",
    });

    await newRequest.save();

    // Format response to match frontend requirements
    const formattedRequest = {
      id: newRequest._id.toString(),
      bloodType: newRequest.bloodType,
      units: newRequest.units,
      status: newRequest.status,
      date: newRequest.createdAt,
    };

    res.status(201).json({
      status: "success",
      data: formattedRequest,
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

    const requests = await BloodRequest.find()
      .populate("hospitalId", "name")
      .sort({ createdAt: -1 });

    // Transform data to match the display table format
    const formattedRequests = requests.map((req) => ({
      id: req._id.toString(), // Convert ID to string
      name: req.hospitalName || "Unknown Hospital",
      bloodType: req.bloodType,
      units: req.units,
      urgency: req.urgency,
      status: req.status,
      date: req.createdAt,
    }));

    res.json({
      status: "success",
      data: formattedRequests,
    });
  } catch (error) {
    console.error("Error fetching blood requests:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Get hospital's requests
router.get("/hospital", async (req, res) => {
  try {
    const requests = await BloodRequest.find({
      hospitalId: new mongoose.Types.ObjectId(req.user.id),
    }).sort({ createdAt: -1 });

    // Format response to match frontend requirements
    const formattedRequests = requests.map((req) => ({
      id: req._id.toString(),
      bloodType: req.bloodType,
      units: req.units,
      status: req.status,
      date: req.createdAt,
    }));

    res.json({
      status: "success",
      data: formattedRequests,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Update request status (admin only)
router.patch("/:requestId/status", async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Admin access required",
      });
    }

    const request = await BloodRequest.findByIdAndUpdate(
      req.params.requestId,
      { status: req.body.status },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        status: "error",
        message: "Request not found",
      });
    }

    // Transform the response to match the expected format
    const formattedRequest = {
      id: request._id.toString(),
      name: request.hospitalName || "Unknown Hospital",
      bloodType: request.bloodType,
      units: request.units,
      urgency: request.urgency,
      status: request.status,
      date: request.createdAt,
    };

    res.json({
      status: "success",
      data: formattedRequest,
    });
  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Get hospital stats
router.get("/stats", async (req, res) => {
  try {
    const stats = await BloodRequest.aggregate([
      {
        $match: {
          hospitalId: new mongoose.Types.ObjectId(req.user.id),
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
          rejected: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
          },
        },
      },
    ]);

    // Always return an object with default values if no stats found
    const defaultStats = { total: 0, pending: 0, approved: 0, rejected: 0 };
    const responseStats = stats.length > 0 ? stats[0] : defaultStats;
    delete responseStats?._id; // Remove _id from response

    res.json({
      status: "success",
      data: responseStats,
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Get hospital's recent requests
router.get("/recent-requests", async (req, res) => {
  try {
    const requests = await BloodRequest.find({
      hospitalId: new ObjectId(req.user.id),
    })
      .sort({ createdAt: -1 })
      .limit(10);

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

// Delete blood request (admin only)
router.delete("/:requestId", async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Admin access required",
      });
    }

    const request = await BloodRequest.findByIdAndDelete(req.params.requestId);

    if (!request) {
      return res.status(404).json({
        status: "error",
        message: "Request not found",
      });
    }

    res.json({
      status: "success",
      message: "Request deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Update blood request (admin only)
router.patch("/:requestId", async (req, res) => {
  try {
    if (req.user.userType !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Admin access required",
      });
    }

    const request = await BloodRequest.findByIdAndUpdate(
      req.params.requestId,
      {
        $set: {
          bloodType: req.body.bloodType,
          units: req.body.units,
          urgency: req.body.urgency,
          status: req.body.status,
        },
      },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        status: "error",
        message: "Request not found",
      });
    }

    // Format response to match frontend requirements
    const formattedRequest = {
      id: request._id.toString(),
      name: request.hospitalName || "Unknown Hospital",
      bloodType: request.bloodType,
      units: request.units,
      urgency: request.urgency,
      status: request.status,
      date: request.createdAt,
    };

    res.json({
      status: "success",
      data: formattedRequest,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

export default router;
