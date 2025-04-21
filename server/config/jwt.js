import dotenv from "dotenv";
import jwt from "jsonwebtoken";

// Load environment variables
dotenv.config();

// Centralized JWT configuration
export const JWT_SECRET = process.env.JWT_SECRET || "motabari3-secret-key";

// JWT options
export const JWT_OPTIONS = {
  expiresIn: "24h",
};

// Token verification function
export const verifyToken = (token) => {
  try {
    console.log("Using JWT_SECRET:", JWT_SECRET);
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, decoded };
  } catch (error) {
    console.error("Token verification error:", error.message);
    return { valid: false, error: error.message };
  }
};
