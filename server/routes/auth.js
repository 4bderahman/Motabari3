import express from "express";
import { NewUsers } from "../models/newUsers.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt.js";
import { Resend } from "resend";
import crypto from "crypto";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from server/.env
dotenv.config({ path: join(__dirname, "../.env") });

const router = express.Router();

// Initialize Resend with API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

router.post("/insert-new-users", async (req, res) => {
  try {
    console.log("Received data:", req.body); // Debug log

    const {
      name,
      email,
      phone,
      password,
      userType,
      age,
      bloodType,
      address,
      contactPerson,
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !password || !userType) {
      console.log("Missing required fields:", {
        name,
        email,
        phone,
        password,
        userType,
      }); // Debug log
      return res.status(400).json({
        status: "error",
        message: "Missing required fields",
      });
    }

    // Check if email already exists
    const existingEmail = await NewUsers.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        status: "error",
        message: "Email already registered. Please use a different email.",
      });
    }

    // Check if phone already exists
    const existingPhone = await NewUsers.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({
        status: "error",
        message:
          "Phone number already registered. Please use a different number.",
      });
    }

    // Create user object based on type
    const userData = {
      name,
      email,
      phone,
      password, // Will be hashed by the pre-save middleware
      userType,
      date: new Date(),
      source: "signup",
    };

    // Add type-specific fields
    if (userType === "donor") {
      if (!age || !bloodType) {
        return res.status(400).json({
          status: "error",
          message: "Age and blood type are required for donors",
        });
      }
      userData.age = age;
      userData.bloodType = bloodType;
    } else if (userType === "hospital") {
      if (!address || !contactPerson) {
        return res.status(400).json({
          status: "error",
          message: "Address and contact person are required for hospitals",
        });
      }
      userData.address = address;
      userData.contactPerson = contactPerson;
    }

    console.log("Creating user with data:", userData); // Debug log

    const newUser = new NewUsers(userData);
    await newUser.save();

    res.status(201).json({
      status: "success",
      message: "Account created successfully!",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      status: "error",
      message: "Error creating account. Please try again.",
    });
  }
});

router.post("/login-user", async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    // Find user by email and userType
    const user = await NewUsers.findOne({ email, userType });

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or user type",
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Invalid password",
      });
    }

    // Generate JWT token with simple payload
    const token = jwt.sign(
      { id: user._id, userType: user.userType },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Log the user data being sent
    console.log("Sending user data:", {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      age: user.age,
      bloodType: user.bloodType,
    });

    // Send response with complete user data
    res.status(200).json({
      status: "success",
      token,
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      age: user.age,
      bloodType: user.bloodType,
      address: user.address,
      contactPerson: user.contactPerson,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      status: "error",
      message: "Error during login. Please try again.",
    });
  }
});

// Forgot password route
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Attempting password reset for email:", email);

    const user = await NewUsers.findOne({ email });

    if (!user) {
      console.log("No user found with email:", email);
      return res.status(404).json({
        status: "error",
        message: "No account found with this email address",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes

    // Save reset token to user
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Create reset URL
    const resetUrl = `http://${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    console.log("Reset URL generated:", resetUrl);

    try {
      // Send email using Resend
      console.log("Attempting to send email with Resend...");

      // In testing mode, always send to the verified email
      const testingEmail = "help.motabari3@gmail.com"; // Your verified Resend email

      const emailResponse = await resend.emails.send({
        from: "Motabari3 <onboarding@resend.dev>",
        to: testingEmail, // Using testing email
        reply_to: user.email, // Original user's email
        subject: "Password Reset Request",
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.5; background-color: #f8fafc;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700;">
                <span style="color: #1f2937;">Mota</span><span style="color: #dc2626;">bari3</span>
              </h1>
              <p style="color: #6b7280; margin-top: 8px; font-size: 16px;">Blood Donation System</p>
            </div>

            <!-- Main Content -->
            <div style="background-color: #ffffff; border-radius: 12px; padding: 32px; margin-bottom: 32px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
              <h2 style="color: #dc2626; margin: 0 0 24px; text-align: center; font-size: 24px; font-weight: 600;">Password Reset Request</h2>
              
              <p style="color: #374151; font-size: 16px; margin-bottom: 16px;">Hello ${user.name},</p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                We received a request to reset your password. For your security, this link will expire in 30 minutes.
              </p>

              <!-- Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}" 
                   style="display: inline-block; 
                          background-color: #dc2626;
                          color: white; 
                          padding: 12px 32px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          font-weight: 500;
                          font-size: 16px;">
                  Reset Password
                </a>
              </div>

              <!-- URL Copy Section -->
              <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; margin-top: 24px;">
                <p style="color: #4b5563; font-size: 14px; margin: 0 0 8px;">
                  Or copy and paste this URL into your browser:
                </p>
                <p style="color: #dc2626; font-size: 14px; word-break: break-all; margin: 0;">
                  ${resetUrl}
                </p>
              </div>

              <!-- Security Notice -->
              <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 24px; font-style: italic;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </div>

            <!-- Footer -->
            <div style="text-align: center;">
              <p style="color: #4b5563; font-size: 16px; margin: 0 0 8px;">Best regards,</p>
              <p style="color: #4b5563; font-size: 16px; font-weight: 500; margin: 0 0 24px;">The Motabari3 Team</p>
              
              <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-top: 24px;">
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 16px;">Need help? Contact our team:</p>
                <p style="color: #4b5563; font-size: 14px; margin: 0;">
                  Yassine: <a href="mailto:yassine@motabari3.com" style="color: #dc2626; text-decoration: none;">yassine@motabari3.com</a>
                  <br>
                  Abderahman: <a href="mailto:abderahman@motabari3.com" style="color: #dc2626; text-decoration: none;">abderahman@motabari3.com</a>
                </p>
              </div>
            </div>

            <!-- Test Email Notice -->
            <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                <strong>Note:</strong> This is a test email. Original request was from: ${user.email}
              </p>
            </div>
          </div>
        `,
      });

      if (emailResponse.error) {
        console.error("Resend API error:", emailResponse.error);
        throw new Error(emailResponse.error.message || "Failed to send email");
      }

      console.log("Email sent successfully:", emailResponse);

      res.json({
        status: "success",
        message: "Password reset instructions sent to your email",
      });
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Reset the token if email fails
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();

      res.status(500).json({
        status: "error",
        message: "Failed to send reset email. Please try again later.",
        details: emailError.message,
      });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      status: "error",
      message: "Error sending reset instructions",
      details: error.message,
    });
  }
});

// Reset password route
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    console.log("Attempting to reset password with token");

    const user = await NewUsers.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      console.log("Invalid or expired reset token");
      return res.status(400).json({
        status: "error",
        message: "Password reset token is invalid or has expired",
      });
    }

    // Set the new password - it will be hashed by the pre-save middleware
    user.password = password;

    // Clear reset token fields
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({
      status: "error",
      message: "Error resetting password. Please try again.",
    });
  }
});

export default router;
