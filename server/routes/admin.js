import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_OPTIONS } from "../config/jwt.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// Admin credentials (in a real app, these would be in a database)
const ADMIN_CREDENTIALS = {
  id: "6790fa3bdbb64b523de271fd", // Using a valid ObjectId format
  email: "admin@motabari3.com",
  password: "motabari3..", // Plain text for simplicity
};

// Admin login
router.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;

    // Check credentials
    if (
      email !== ADMIN_CREDENTIALS.email ||
      password !== ADMIN_CREDENTIALS.password
    ) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    // Generate JWT token with only necessary fields
    const token = jwt.sign(
      {
        id: ADMIN_CREDENTIALS.id,
        email: ADMIN_CREDENTIALS.email,
        userType: "admin",
      },
      JWT_SECRET,
      JWT_OPTIONS
    );

    console.log("Generated admin token for:", ADMIN_CREDENTIALS.email);

    // Send response
    res.status(200).json({
      status: "success",
      token,
      id: ADMIN_CREDENTIALS.id,
      email: ADMIN_CREDENTIALS.email,
      userType: "admin",
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      status: "error",
      message: "Error during login. Please try again.",
    });
  }
});

export default router;
