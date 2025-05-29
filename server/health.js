import express from "express";
import mongoose from "mongoose";

const router = express.Router();

// Health check endpoint
router.get("/health", async (req, res) => {
  try {
    // Check database connection
    const dbState = mongoose.connection.readyState;
    const dbStatus = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting"
    };

    // Check if database is connected
    if (dbState !== 1) {
      return res.status(503).json({
        status: "unhealthy",
        message: "Database not connected",
        database: dbStatus[dbState],
        timestamp: new Date().toISOString()
      });
    }

    // Perform a simple database operation to verify connectivity
    await mongoose.connection.db.admin().ping();

    res.status(200).json({
      status: "healthy",
      message: "Service is running normally",
      database: "connected",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0"
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(503).json({
      status: "unhealthy",
      message: "Health check failed",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;