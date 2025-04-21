import express from "express";
import { ObjectId } from "mongodb";
import DonateBlood from "../models/donateBlood.js";
import { NewUsers } from "../models/newUsers.js";
import QRCodeGenerator from "qrcode";
import jwt from "jsonwebtoken";
import { encryptData, decryptData, generateQRCode } from "../utils/qrUtils.js";
import { QRCode } from "../models/QRCode.js";
import { JWT_SECRET } from "../config/jwt.js";
import { authMiddleware } from "../middleware/auth.js";
import { Donation } from "../models/Donation.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get donor profile
router.get("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    console.log("Fetching user with ID:", userId); // Debug log

    const donor = await NewUsers.findById(userId).select("-password");
    if (!donor) {
      return res.status(404).json({
        status: "error",
        message: "Donor not found",
      });
    }

    console.log("Found donor data:", donor); // Debug log

    res.json({
      status: "success",
      data: donor,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Get donation history
router.get("/donations", async (req, res) => {
  try {
    const donations = await DonateBlood.find({
      donorId: req.user._id,
    }).sort({ date: -1 });

    const formattedDonations = donations.map((donation) => ({
      id: donation._id.toString(),
      date: donation.date,
      units: donation.units || 450,
      donated: donation.donated,
      bloodType: donation.bloodType,
      message: donation.message,
    }));

    res.json({
      status: "success",
      data: formattedDonations,
    });
  } catch (error) {
    console.error("Error fetching donations:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Generate QR Code
router.post("/generate-qr", async (req, res) => {
  try {
    console.log("Starting QR code generation...");
    console.log("User object:", req.user); // Debug log

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required",
      });
    }

    // Get completed donations for this donor
    const completedDonations = await Donation.find({
      donorId: req.user._id,
      status: "donated",
    })
      .sort({ date: -1 })
      .lean();

    // Format donations for QR code data
    const formattedDonations = completedDonations.map((donation) => ({
      date: donation.date,
      units: donation.units,
      bloodType: donation.bloodType,
      status: donation.status,
    }));

    // Generate unique QR code
    const code = generateQRCode();
    console.log("Generated code:", code);

    // Data to be encrypted
    const data = {
      donorId: req.user._id.toString(),
      name: req.user.name,
      bloodType: req.user.bloodType,
      age: req.user.age,
      lastDonation: completedDonations[0]?.date || null,
      donationHistory: formattedDonations,
      timestamp: new Date().toISOString(),
    };
    console.log("Data to encrypt:", data);

    const encryptedData = encryptData(data);
    console.log("Data encrypted successfully");

    // Create QR code record
    console.log("Creating QR code record...");
    const qrCode = new QRCode({
      code,
      donorId: req.user._id,
      data: encryptedData,
      expiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    });

    console.log("Saving QR code to database...");
    await qrCode.save();

    // Generate QR code image
    const qrImage = await QRCodeGenerator.toDataURL(code);

    res.status(201).json({
      status: "success",
      data: {
        code,
        qrImage,
        expiry: qrCode.expiry,
      },
    });
  } catch (error) {
    console.error("QR generation error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Error generating QR code",
    });
  }
});

// Verify QR Code - Admin only
router.get("/verify-qr/:code", async (req, res) => {
  try {
    const { code } = req.params;
    console.log("\n=== QR Code Verification Start ===");
    console.log("QR Code:", code);
    console.log("User type:", req.user.userType);

    // Check if user is admin or donor
    if (req.user.userType !== "admin" && req.user.userType !== "donor") {
      console.log("Error: Invalid user type. UserType =", req.user.userType);
      return res.status(403).json({
        status: "error",
        message: "Access denied. Admin or donor only.",
      });
    }

    console.log("User verification passed");

    // Find QR code in database
    const qrCodeDoc = await QRCode.findOne({ code });
    if (!qrCodeDoc) {
      console.log("Error: QR code not found in database");
      return res.status(404).json({
        status: "error",
        message: "QR code not found",
      });
    }

    console.log("QR code found in database");

    // Check if QR code has expired
    if (qrCodeDoc.expiry < new Date()) {
      console.log("Error: QR code has expired");
      return res.status(400).json({
        status: "error",
        message: "QR code has expired",
      });
    }

    // Decrypt data
    const decryptedData = decryptData(qrCodeDoc.data);
    console.log("Decrypted QR data:", decryptedData);

    // Get donor information
    const donor = await NewUsers.findById(decryptedData.donorId);
    if (!donor) {
      console.log("Error: Donor not found with ID:", decryptedData.donorId);
      return res.status(404).json({
        status: "error",
        message: "Donor not found",
      });
    }

    // Get completed donations from Donation model
    const completedDonations = await Donation.find({
      donorId: donor._id,
      status: "donated",
    })
      .sort({ date: -1 })
      .lean();

    // Format donations
    const formattedDonations = completedDonations.map((donation) => ({
      date: donation.date,
      units: donation.units,
      bloodType: donation.bloodType,
      status: donation.status,
    }));

    console.log("Donor found, sending response");
    res.json({
      status: "success",
      data: {
        name: donor.name,
        bloodType: donor.bloodType,
        age: donor.age,
        donorId: donor._id,
        lastDonation: completedDonations[0]?.date || null,
        donationHistory: formattedDonations,
      },
    });
    console.log("=== QR Code Verification End ===\n");
  } catch (error) {
    console.error("QR Verification Error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Update donor profile
router.put("/profile", async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, email, age, address } = req.body;

    const updatedDonor = await NewUsers.findByIdAndUpdate(
      userId,
      {
        $set: {
          name,
          phone,
          email,
          age,
          address,
        },
      },
      { new: true, runValidators: true }
    ).select("-password -__v");

    res.json({
      status: "success",
      data: updatedDonor,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Update profile route
router.put("/update-profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id; // Handle both possible token formats

    console.log("Token:", token);
    console.log("Decoded:", decoded);
    console.log("UserId:", userId);
    console.log("Update data:", req.body);

    const updatedUser = await NewUsers.findByIdAndUpdate(
      userId,
      {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        age: req.body.age,
        bloodType: req.body.bloodType,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    console.log("Updated user:", updatedUser);

    res.json({
      status: "success",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Error updating profile",
    });
  }
});

// Get appointments
router.get("/appointments", async (req, res) => {
  try {
    const appointments = await Donation.find({
      donorId: req.user._id,
      status: { $in: ["not_yet", "donated"] },
    }).sort({ date: 1 });

    const formattedAppointments = appointments.map((appt) => ({
      id: appt._id.toString(),
      date: appt.date,
      units: appt.units || 450, // Standard donation amount
      status: appt.status,
    }));

    res.json({
      status: "success",
      data: formattedAppointments,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Schedule donation appointment
router.post("/schedule-donation", async (req, res) => {
  try {
    const { date, units = 450 } = req.body;

    // Create appointment in Donation model
    const appointment = await Donation.create({
      donorId: req.user._id,
      date,
      units,
      status: "not_yet",
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      bloodType: req.user.bloodType,
    });

    // Also create in DonateBlood model for admin dashboard
    await DonateBlood.create({
      donorId: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      bloodType: req.user.bloodType,
      message: "Scheduled donation",
      donated: false,
      date: date,
    });

    res.json({
      status: "success",
      data: {
        id: appointment._id.toString(),
        date: appointment.date,
        units: appointment.units,
        status: appointment.status,
      },
    });
  } catch (error) {
    console.error("Scheduling error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

export default router;
