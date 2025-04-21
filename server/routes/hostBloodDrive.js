import express from "express";
import HostBloodDrive from "../models/hostBloodDrive.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

// Get all blood drives
router.get("/", async (req, res) => {
  try {
    const drives = await HostBloodDrive.find().lean();
    const formattedDrives = drives.map((drive) => ({
      id: drive._id.toString(),
      name: drive.name,
      phone: drive.phone,
      email: drive.email,
      institute: drive.institute,
      designation: drive.designation,
      city: drive.city,
      done: drive.done,
      message: drive.message,
    }));
    res.json({
      status: "success",
      data: formattedDrives,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Update blood drive status
router.patch("/:id/status", async (req, res) => {
  try {
    const drive = await HostBloodDrive.findByIdAndUpdate(
      req.params.id,
      { done: req.body.done },
      { new: true }
    );

    if (!drive) {
      return res.status(404).json({
        status: "error",
        message: "Blood drive not found",
      });
    }

    // Get all drives after update
    const drives = await HostBloodDrive.find().lean();
    const formattedDrives = drives.map((drive) => ({
      id: drive._id.toString(),
      name: drive.name,
      phone: drive.phone,
      email: drive.email,
      institute: drive.institute,
      designation: drive.designation,
      city: drive.city,
      done: drive.done,
      message: drive.message,
    }));

    res.json({
      status: "success",
      message: "Blood drive status updated successfully",
      data: formattedDrives,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Update blood drive details
router.put("/update/:id", async (req, res) => {
  try {
    const drive = await HostBloodDrive.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!drive) {
      return res.status(404).json({
        status: "error",
        message: "Blood drive not found",
      });
    }

    // Get all drives after update
    const drives = await HostBloodDrive.find().lean();
    const formattedDrives = drives.map((drive) => ({
      id: drive._id.toString(),
      name: drive.name,
      phone: drive.phone,
      email: drive.email,
      institute: drive.institute,
      designation: drive.designation,
      city: drive.city,
      done: drive.done,
      message: drive.message,
    }));

    res.json({
      status: "success",
      message: "Blood drive updated successfully",
      data: formattedDrives,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Delete blood drive
router.delete("/delete/:id", async (req, res) => {
  try {
    const drive = await HostBloodDrive.findByIdAndDelete(req.params.id);

    if (!drive) {
      return res.status(404).json({
        status: "error",
        message: "Blood drive not found",
      });
    }

    // Get remaining drives after deletion
    const drives = await HostBloodDrive.find().lean();
    const formattedDrives = drives.map((drive) => ({
      id: drive._id.toString(),
      name: drive.name,
      phone: drive.phone,
      email: drive.email,
      institute: drive.institute,
      designation: drive.designation,
      city: drive.city,
      done: drive.done,
      message: drive.message,
    }));

    res.json({
      status: "success",
      message: "Blood drive deleted successfully",
      data: formattedDrives,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

export default router;
