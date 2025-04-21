import express from "express";
import DonateBlood from "../models/donateBlood.js";
import { authMiddleware } from "../middleware/auth.js";
import { Donation } from "../models/Donation.js";

const router = express.Router();

router.use(authMiddleware);

// Update donation status
router.patch("/:id/status", async (req, res) => {
  try {
    // Update in DonateBlood model using findByIdAndUpdate to preserve all fields
    const donateBloodRecord = await DonateBlood.findByIdAndUpdate(
      req.params.id,
      { donated: req.body.donated },
      { new: true }
    );

    if (!donateBloodRecord) {
      return res.status(404).json({
        status: "error",
        message: "Donation not found",
      });
    }

    // Find and update the corresponding donation in Donation model
    await Donation.updateMany(
      {
        donorId: donateBloodRecord.donorId,
        name: donateBloodRecord.name,
        email: donateBloodRecord.email,
        bloodType: donateBloodRecord.bloodType,
        date: donateBloodRecord.date,
      },
      { status: req.body.donated ? "donated" : "not_yet" }
    );

    // Get all donations for response
    const donations = await DonateBlood.find().lean();
    const formattedDonations = donations.map((d) => ({
      id: d._id.toString(),
      name: d.name,
      phone: d.phone,
      email: d.email,
      bloodType: d.bloodType,
      donated: d.donated,
      message: d.message,
      date: d.date,
    }));

    res.json({
      status: "success",
      data: formattedDonations,
    });
  } catch (error) {
    console.error("Status update error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Update donation details
router.put("/update/:id", async (req, res) => {
  try {
    const updatedDonation = await DonateBlood.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedDonation) {
      return res.status(404).json({
        status: "error",
        message: "Donation not found",
      });
    }

    // Get all donations after update
    const donations = await DonateBlood.find().lean();
    const formattedDonations = donations.map((donation) => ({
      id: donation._id.toString(),
      name: donation.name,
      phone: donation.phone,
      email: donation.email,
      bloodType: donation.bloodType,
      donated: donation.donated,
      message: donation.message,
    }));

    res.json({
      status: "success",
      message: "Donation updated successfully",
      data: formattedDonations,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Delete donation
router.delete("/delete/:id", async (req, res) => {
  try {
    const donation = await DonateBlood.findByIdAndDelete(req.params.id);

    if (!donation) {
      return res.status(404).json({
        status: "error",
        message: "Donation not found",
      });
    }

    // Get remaining donations after deletion
    const donations = await DonateBlood.find().lean();
    const formattedDonations = donations.map((donation) => ({
      id: donation._id.toString(),
      name: donation.name,
      phone: donation.phone,
      email: donation.email,
      bloodType: donation.bloodType,
      donated: donation.donated,
      message: donation.message,
    }));

    res.json({
      status: "success",
      message: "Donation deleted successfully",
      data: formattedDonations,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

export default router;
