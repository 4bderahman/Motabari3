import express from "express";
import { BloodRequest } from "../models/bloodRequest.js";
import { authMiddleware } from "../middleware/auth.js";
import { NewUsers } from "../models/newUsers.js";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import NeedBlood from "../models/needBlood.js";

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

    // Fetch requests from BloodRequest collection (hospital requests)
    const hospitalRequests = await BloodRequest.find()
      .populate("hospitalId", "name")
      .sort({ createdAt: -1 });

    // Format hospital requests
    const formattedHospitalRequests = hospitalRequests.map((req) => ({
      id: req._id.toString(),
      name: req.hospitalName || "Unknown Hospital",
      bloodType: req.bloodType || "",
      units: req.units || 1,
      urgency: req.urgency || "normal",
      status: req.status || "pending",
      date: req.createdAt,
      source: "hospital",
      collection: "bloodrequests"
    }));

    // Fetch requests from NeedBlood collection (donor/public requests)
    const donorRequests = await NeedBlood.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    // Format donor requests
    const formattedDonorRequests = donorRequests.map((req) => ({
      id: req._id.toString(),
      name: req.patientName || (req.userId && req.userId.name) || "Unknown",
      bloodType: req.bloodType || "",
      units: req.units || 1,
      urgency: req.urgency || "normal",
      status: req.status || (req.given ? "fulfilled" : "pending"),
      date: req.requestDate || req.createdAt,
      source: "donor",
      collection: "needbloods",
      contactNumber: req.contactNumber || "",
      hospital: req.hospital || "",
      location: req.location || ""
    }));

    // Combine both sets of requests
    const allRequests = [...formattedHospitalRequests, ...formattedDonorRequests];

    // Sort by date (most recent first)
    allRequests.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    console.log("Sending blood requests with filter fields:", allRequests.length);

    res.json({
      status: "success",
      data: allRequests,
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

    const { status, collection } = req.body;
    const requestId = req.params.requestId;
    let request;

    // Handle based on which collection the request belongs to
    if (collection === "needbloods") {
      // For NeedBlood collection
      request = await NeedBlood.findByIdAndUpdate(
        requestId,
        { 
          status: status, 
          given: status === "fulfilled" // Set given field for backward compatibility
        },
        { new: true }
      ).populate("userId", "name email");

      if (request) {
        // Format response for NeedBlood
        return res.json({
          status: "success",
          data: {
            id: request._id.toString(),
            name: request.patientName || (request.userId && request.userId.name) || "Unknown",
            bloodType: request.bloodType,
            units: request.units || 1,
            urgency: request.urgency || "normal",
            status: request.status,
            date: request.requestDate || request.createdAt,
            source: "donor",
            collection: "needbloods"
          }
        });
      }
    } else {
      // For BloodRequest collection (default)
      request = await BloodRequest.findByIdAndUpdate(
        requestId,
        { status },
        { new: true }
      );

      if (request) {
        // Format response for BloodRequest
        return res.json({
          status: "success",
          data: {
            id: request._id.toString(),
            name: request.hospitalName || "Unknown Hospital",
            bloodType: request.bloodType,
            units: request.units,
            urgency: request.urgency,
            status: request.status,
            date: request.createdAt,
            source: "hospital",
            collection: "bloodrequests"
          }
        });
      }
    }

    // If no request was found in either collection
    return res.status(404).json({
      status: "error",
      message: "Request not found",
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

    const { collection } = req.query;
    const requestId = req.params.requestId;
    let result;

    // Handle based on which collection the request belongs to
    if (collection === "needbloods") {
      // For NeedBlood collection
      result = await NeedBlood.findByIdAndDelete(requestId);
    } else {
      // For BloodRequest collection (default)
      result = await BloodRequest.findByIdAndDelete(requestId);
    }

    if (!result) {
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

    const { collection } = req.body;
    const requestId = req.params.requestId;
    let request;

    // Updates common to both collections
    const updateData = {
      bloodType: req.body.bloodType,
      units: req.body.units,
      urgency: req.body.urgency,
      status: req.body.status,
    };

    // Handle based on which collection the request belongs to
    if (collection === "needbloods") {
      // For NeedBlood collection
      request = await NeedBlood.findByIdAndUpdate(
        requestId,
        { 
          $set: updateData,
          given: req.body.status === "fulfilled" // Set given field for backward compatibility
        },
        { new: true }
      ).populate("userId", "name email");

      if (request) {
        // Format response for NeedBlood
        return res.json({
          status: "success",
          data: {
            id: request._id.toString(),
            name: request.patientName || (request.userId && request.userId.name) || "Unknown",
            bloodType: request.bloodType,
            units: request.units || 1,
            urgency: request.urgency || "normal",
            status: request.status,
            date: request.requestDate || request.createdAt,
            source: "donor",
            collection: "needbloods"
          }
        });
      }
    } else {
      // For BloodRequest collection (default)
      request = await BloodRequest.findByIdAndUpdate(
        requestId,
        { $set: updateData },
        { new: true }
      );

      if (request) {
        // Format response for BloodRequest
        return res.json({
          status: "success",
          data: {
            id: request._id.toString(),
            name: request.hospitalName || "Unknown Hospital",
            bloodType: request.bloodType,
            units: request.units,
            urgency: request.urgency,
            status: request.status,
            date: request.createdAt,
            source: "hospital",
            collection: "bloodrequests"
          }
        });
      }
    }

    return res.status(404).json({
      status: "error",
      message: "Request not found",
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
