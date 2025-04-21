import jwt from "jsonwebtoken";
import { NewUsers } from "../models/newUsers.js";
import { JWT_SECRET } from "../config/jwt.js";
import { ObjectId } from "mongodb";

// Admin credentials (should match the ones in admin.js)
const ADMIN_CREDENTIALS = {
  id: "6790fa3bdbb64b523de271fd", // Using a valid ObjectId format
  email: "admin@motabari3.com",
  userType: "admin",
};

export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "No authentication token, access denied",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded token:", decoded); // Debug log

    // Check if this is an admin token
    if (decoded.userType === "admin" && decoded.id === ADMIN_CREDENTIALS.id) {
      req.user = {
        _id: new ObjectId(ADMIN_CREDENTIALS.id),
        email: ADMIN_CREDENTIALS.email,
        userType: "admin",
      };
      return next();
    }

    // For non-admin users, find in database
    const user = await NewUsers.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Token is invalid",
      });
    }

    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({
      status: "error",
      message: "Token is invalid",
    });
  }
};

// Middleware to check if user is a donor
export const isDonor = (req, res, next) => {
  if (req.user.userType !== "donor") {
    return res.status(403).json({
      status: "error",
      message: "Access denied. Donor only route.",
    });
  }
  next();
};

// Middleware to check if user is a hospital
export const isHospital = (req, res, next) => {
  if (req.user.userType !== "hospital") {
    return res.status(403).json({
      status: "error",
      message: "Access denied. Hospital only route.",
    });
  }
  next();
};
