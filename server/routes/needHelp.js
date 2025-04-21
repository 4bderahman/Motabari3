import express from "express";
import NeedHelp from "../models/needHelp.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

// Get all help requests
router.get("/", async (req, res) => {
  try {
    const helps = await NeedHelp.find().lean();
    const formattedHelps = helps.map((help) => ({
      id: help._id.toString(),
      name: help.name,
      phone: help.phone,
      email: help.email,
      reason: help.reason,
      done: help.done || false,
      message: help.message,
      createdAt: help.createdAt,
    }));

    res.json({
      status: "success",
      data: formattedHelps,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Update help request
router.put("/update/:id", async (req, res) => {
  try {
    const updatedHelp = await NeedHelp.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        message: req.body.message,
        done: req.body.done || false,
      },
      { new: true }
    );

    if (!updatedHelp) {
      return res.status(404).json({
        status: "error",
        message: "Help request not found",
      });
    }

    // Get all help requests after update
    const helps = await NeedHelp.find().lean();
    const formattedHelps = helps.map((help) => ({
      id: help._id.toString(),
      name: help.name,
      phone: help.phone,
      email: help.email,
      message: help.message,
      done: help.done || false,
      createdAt: help.createdAt,
    }));

    res.json({
      status: "success",
      message: "Help request updated successfully",
      data: formattedHelps,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Delete help request
router.delete("/delete/:id", async (req, res) => {
  try {
    const help = await NeedHelp.findByIdAndDelete(req.params.id);

    if (!help) {
      return res.status(404).json({
        status: "error",
        message: "Help request not found",
      });
    }

    // Get remaining help requests after deletion
    const helps = await NeedHelp.find().lean();
    const formattedHelps = helps.map((help) => ({
      id: help._id.toString(),
      name: help.name,
      phone: help.phone,
      email: help.email,
      reason: help.reason,
      answered: help.answered,
      message: help.message,
    }));

    res.json({
      status: "success",
      message: "Help request deleted successfully",
      data: formattedHelps,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

export default router;
