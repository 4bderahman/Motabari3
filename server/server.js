import dotenv from "dotenv";
import express, { json } from "express";
import mongoose from "mongoose";
import cors from "cors";
import DonateBlood from "./models/donateBlood.js";
import { NewUsers } from "./models/newUsers.js";
import NeedBlood from "./models/needBlood.js";
import NeedHelp from "./models/needHelp.js";
import HostBloodDrive from "./models/hostBloodDrive.js";
import { ObjectId } from "mongodb";
import BloodBank from "./models/bloodBank.js";
import authRoutes from "./routes/auth.js";
import donorRoutes from "./routes/donor.js";
import { authMiddleware, isDonor, isHospital } from "./middleware/auth.js";
import hospitalRoutes from "./routes/hospital.js";
import adminRoutes from "./routes/admin.js";
import newUsersRoutes from "./routes/newUsers.js";
import bloodRequestRoutes from "./routes/bloodRequest.js";
import donateBloodRoutes from "./routes/donateBlood.js";
import hostBloodDriveRoutes from "./routes/hostBloodDrive.js";
import needHelpRoutes from "./routes/needHelp.js";
import { QRCode } from "./models/QRCode.js";
import donationsRoutes from "./routes/donations.js";
import { BloodRequest } from "./models/bloodRequest.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(json());

// Add auth routes
app.use("/", authRoutes);

// Add protected donor routes - only use authMiddleware
app.use("/api/donor", authMiddleware, donorRoutes);

// Protected hospital routes
app.use("/api/hospital", authMiddleware, isHospital, hospitalRoutes);

// Admin routes
app.use("/admin", adminRoutes);

// New users routes
app.use("/api/new-users", authMiddleware, newUsersRoutes);

// Blood request routes
app.use("/api/blood-request", authMiddleware, bloodRequestRoutes);

// Donate blood routes
app.use("/api/donate-blood", authMiddleware, donateBloodRoutes);

// Host blood drive routes
app.use("/api/host-blood-drive", authMiddleware, hostBloodDriveRoutes);

// Need help routes
app.use("/api/need-help", authMiddleware, needHelpRoutes);

// Add donations routes
app.use("/api/donations", donationsRoutes);

const connectionString = `${process.env.CONNECTION_STRING}`;

mongoose.connect(connectionString, { dbName: "hemocelldb" }).then(() => {
  console.log("MongoDB Connected...");
  // Log all registered models
  console.log("Registered MongoDB Models:", Object.keys(mongoose.models));
});

// ========================================

// // INSERTING QUERIES

// for inserting DONATE BLOOD page form data
app.post("/create-donate-blood", authMiddleware, async (req, res) => {
  try {
    const { name, phone, email, bloodType, message, donorId, date } = req.body;

    // Validate required fields
    if (!name || !phone || !email || !bloodType || !date) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields",
      });
    }

    // Validate blood type
    const validBloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    if (!validBloodTypes.includes(bloodType)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid blood type",
      });
    }

    // Create donation record
    const newDonateBlood = new DonateBlood({
      name,
      phone,
      email,
      bloodType,
      message,
      donorId,
      date,
      donated: false,
    });

    await newDonateBlood.save();

    // Update user's donation history if donorId exists
    if (donorId) {
      await NewUsers.findByIdAndUpdate(donorId, {
        $push: {
          donationHistory: {
            donationId: newDonateBlood._id,
            date: date,
            bloodType,
            status: "pending",
          },
        },
        lastDonation: date,
      });
    }

    res.status(201).json({
      status: "success",
      message: "Donation recorded successfully",
      data: newDonateBlood,
    });
  } catch (error) {
    console.error("Error creating donation:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Error recording donation",
    });
  }
});

// INSERINTG IN NEW_USERS TABLE
app.post("/insert-new-users", (req, res) => {
  const name = req.body.name;
  const phone = req.body.phone;
  const email = req.body.email;
  const date = req.body.date;
  const source = req.body.source;

  const newUsers = new NewUsers({
    name,
    phone,
    email,
    date,
    source,
  });

  newUsers.save().then(() => res.json("New Users Added!"));
});

// for inserting HOST BLOOD DRIVE page form data
app.post("/create-host-blood-drive", (req, res) => {
  const name = req.body.name;
  const phone = req.body.phone;
  const email = req.body.email;
  const institute = req.body.institute;
  const designation = req.body.designation;
  const city = req.body.city;
  const message = req.body.message;

  const hostBloodDrive = new HostBloodDrive({
    name,
    phone,
    email,
    institute,
    designation,
    city,
    message,
  });

  hostBloodDrive.save().then(() => res.json("Host Blood Drive Added!"));
});

// for inserting NEED BLOOD page form data
app.post("/create-need-blood", authMiddleware, async (req, res) => {
  try {
    // Extract data from the frontend form with its current field names
    const { name, email, phone, bloodType, message, units, urgency } = req.body;
    const userId = req.user._id; // Get userId from the authenticated user
    
    // Get user details for hospital name and user type
    const user = await NewUsers.findById(userId).lean();
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Basic validation
    if (!name || !phone || !bloodType) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields",
      });
    }

    // Check if units is a valid number
    const bloodUnits = parseInt(units, 10) || 1; // Default to 1 if not provided or invalid
    if (bloodUnits < 1) {
      return res.status(400).json({
        status: "error",
        message: "Units must be at least 1",
      });
    }

    // Validate urgency level
    const validUrgency = urgency || "normal"; // Default to normal if not provided
    const validUrgencyLevels = ["normal", "urgent", "critical"];
    if (!validUrgencyLevels.includes(validUrgency)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid urgency level",
      });
    }

    // Determine user type and create request in appropriate collection
    const userType = user.userType || "donor"; // Default to donor if not specified
    let savedRequest;

    if (userType === "hospital") {
      // For hospital users, create request in BloodRequest collection
      const bloodRequest = new BloodRequest({
        hospitalId: userId,
        hospitalName: user.name || "Unknown Hospital",
        bloodType: bloodType,
        units: bloodUnits,
        urgency: validUrgency, // Use the validated urgency level
        status: "pending"
      });

      savedRequest = await bloodRequest.save();
      
      res.status(201).json({
        status: "success",
        message: "Hospital blood request created successfully!",
        data: {
          bloodRequest: savedRequest
        }
      });
    } else {
      // For donor/regular users, create request in NeedBlood collection
      const needBlood = new NeedBlood({
        userId: userId,
        patientName: name, // Map name to patientName
        bloodType: bloodType,
        units: bloodUnits, // Use parsed units
        hospital: user.name || "Not specified", // Use user's name as hospital
        location: "Not specified", // Default value
        contactNumber: phone, // Map phone to contactNumber
        notes: message, // Map message to notes
        urgency: validUrgency, // Use the validated urgency level
        source: "donor" // Explicitly mark as donor source
      });

      savedRequest = await needBlood.save();
      
      res.status(201).json({
        status: "success",
        message: "Donor blood request created successfully!",
        data: {
          needBlood: savedRequest
        }
      });
    }
  } catch (error) {
    console.error("Error creating Need Blood request:", error);
    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        status: "error",
        message: "Validation failed: " + error.message,
        errors: error.errors,
      });
    }
    // Handle other errors
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to create Need Blood request",
    });
  }
});

// for inserting NEED HELP page form data
app.post("/create-need-help", async (req, res) => {
  try {
    const { name, phone, email, reason, message } = req.body;

    // Basic validation
    if (!name || !phone || !email) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields (name, phone, email)",
      });
    }

    const needHelp = new NeedHelp({
      name,
      phone,
      email,
      reason: reason || "", // Default to empty string if not provided
      message: message || "",
    });

    const savedNeedHelp = await needHelp.save();
    
    res.status(201).json({
      status: "success",
      message: "Help request submitted successfully",
      data: savedNeedHelp
    });
  } catch (error) {
    console.error("Error creating help request:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to create help request",
    });
  }
});

// ========================================

// SELECTING QUERIES
// for getting NEW USERS table data
app.get("/api/dashboard", authMiddleware, async (req, res) => {
  try {
    const users = await NewUsers.find().lean();
    const formattedUsers = users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      phone: user.phone,
      email: user.email,
      date: user.date,
      source: user.source,
      checked: user.checked,
    }));
    res.json({
      status: "success",
      data: formattedUsers,
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

// Stats endpoint
app.get("/api/stats", authMiddleware, async (req, res) => {
  try {
    console.log("Received stats request");
    const now = new Date();
    
    // Calculate dates for current month
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Calculate dates for previous month
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    console.log("Dates:", {
      now: now.toISOString(),
      currentMonthStart: currentMonthStart.toISOString(),
      prevMonthStart: prevMonthStart.toISOString(),
      prevMonthEnd: prevMonthEnd.toISOString()
    });

    // Get current month counts
    const [donateBloodCount, needBloodCount, hostDriveCount, needHelpCount] =
      await Promise.all([
        DonateBlood.countDocuments({ createdAt: { $gte: currentMonthStart } }),
        NeedBlood.countDocuments({ createdAt: { $gte: currentMonthStart } }),
        HostBloodDrive.countDocuments({
          createdAt: { $gte: currentMonthStart },
        }),
        NeedHelp.countDocuments({ createdAt: { $gte: currentMonthStart } }),
      ]);

    console.log("Current month counts:", {
      donateBloodCount,
      needBloodCount,
      hostDriveCount,
      needHelpCount,
    });

    // Get previous month counts
    const [
      prevDonateBloodCount,
      prevNeedBloodCount,
      prevHostDriveCount,
      prevNeedHelpCount,
    ] = await Promise.all([
      DonateBlood.countDocuments({
        createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd },
      }),
      NeedBlood.countDocuments({
        createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd },
      }),
      HostBloodDrive.countDocuments({
        createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd },
      }),
      NeedHelp.countDocuments({
        createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd },
      }),
    ]);

    console.log("Previous month counts:", {
      prevDonateBloodCount,
      prevNeedBloodCount,
      prevHostDriveCount,
      prevNeedHelpCount,
    });

    // Calculate percentage changes
    const calculatePercentageChange = (current, previous) => {
      if (previous === 0) return current === 0 ? 0 : 100;
      return ((current - previous) / previous) * 100;
    };

    const response = {
      status: "success",
      current: {
        donateBlood: donateBloodCount,
        needBlood: needBloodCount,
        hostDrive: hostDriveCount,
        needHelp: needHelpCount,
      },
      percentageChanges: {
        donateBlood: calculatePercentageChange(
          donateBloodCount,
          prevDonateBloodCount
        ),
        needBlood: calculatePercentageChange(
          needBloodCount,
          prevNeedBloodCount
        ),
        hostDrive: calculatePercentageChange(
          hostDriveCount,
          prevHostDriveCount
        ),
        needHelp: calculatePercentageChange(needHelpCount, prevNeedHelpCount),
      },
    };

    console.log("Sending response:", response);
    res.json(response);
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({
      status: "error",
      message: "Error fetching stats",
      current: {
        donateBlood: 0,
        needBlood: 0,
        hostDrive: 0,
        needHelp: 0,
      },
      percentageChanges: {
        donateBlood: 0,
        needBlood: 0,
        hostDrive: 0,
        needHelp: 0,
      },
    });
  }
});

// for getting DONATE BLOOD table data
app.get("/api/donate-blood", authMiddleware, async (req, res) => {
  try {
    const donations = await DonateBlood.find().lean();
    const formattedDonations = donations.map((donation) => ({
      id: donation._id.toString(),
      name: donation.name,
      phone: donation.phone,
      email: donation.email,
      bloodType: donation.bloodType,
      donated: donation.donated,
      message: donation.message,
      date: donation.date,
    }));
    res.json({
      status: "success",
      data: formattedDonations,
    });
  } catch (err) {
    console.error("Error fetching donations:", err);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

// for getting NEED BLOOD table data
app.get("/api/need-blood", authMiddleware, async (req, res) => {
  try {
    const needs = await NeedBlood.find().lean().populate('userId', 'name email');
    const formattedNeeds = needs.map((need) => ({
      id: need._id.toString(),
      name: need.patientName || (need.userId && need.userId.name) || "Unknown",  // Use patientName first, then userId.name
      phone: need.contactNumber || need.phone || "Unknown",  // Use contactNumber or legacy phone field
      email: (need.userId && need.userId.email) || need.email || "Unknown",  // Use userId.email or legacy email field
      bloodType: need.bloodType,
      given: need.status === "fulfilled" || need.given || false,  // Check both new and old status fields
      message: need.notes || need.message || "",  // Use notes or legacy message field
      units: need.units || 1,
      hospital: need.hospital || "Not specified",
      location: need.location || "Not specified",
      urgency: need.urgency || "normal",
    }));
    res.json({
      status: "success",
      data: formattedNeeds,
    });
  } catch (err) {
    console.error("Error fetching blood needs:", err);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

// for getting HOST BLOOD DRIVE table data
app.get("/api/host-blood-drive", authMiddleware, async (req, res) => {
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
  } catch (err) {
    console.error("Error fetching blood drives:", err);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

// for getting NEED HELP table data
app.get("/api/need-help", authMiddleware, async (req, res) => {
  try {
    const helps = await NeedHelp.find().lean();
    const formattedHelps = helps.map((help) => ({
      id: help._id.toString(),
      name: help.name,
      phone: help.phone,
      email: help.email,
      reason: help.reason || "",
      answered: help.answered,
      message: help.message || "",
      createdAt: help.createdAt,
    }));
    res.json({
      status: "success",
      data: formattedHelps,
    });
  } catch (err) {
    console.error("Error fetching help requests:", err);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

// ========================================

// UPDATING QUERIES
// for updating NEED BLOOD table `given` value
app.put("/api/need-blood/given", authMiddleware, async (req, res) => {
  const id = req.body.id;
  const given = req.body.status; // This is a boolean value from the request
  
  try {
    // Convert the boolean 'given' value to a status string
    const status = given ? "fulfilled" : "pending";
    
    // Update both old and new status fields for compatibility
    const updatedNeed = await NeedBlood.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        given: given, // For backward compatibility
        status: status // New field from the updated schema
      },
      { new: true }
    ).lean();

    if (!updatedNeed) {
      return res.status(404).json({
        status: "error",
        message: "Record not found",
      });
    }

    // Format the response with the required fields for the UI
    res.json({
      status: "success",
      data: {
        ...updatedNeed,
        id: updatedNeed._id.toString(),
        given: updatedNeed.status === "fulfilled" || updatedNeed.given || false,
      },
    });
  } catch (err) {
    console.error("Error updating blood need:", err);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

// for updating HOST BLOOD DRIVE table `done` value
app.put("/api/host-blood-drive/done", authMiddleware, async (req, res) => {
  const id = req.body.id;
  const done = req.body.status;
  try {
    const updatedDrive = await HostBloodDrive.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { done },
      { new: true }
    ).lean();

    if (!updatedDrive) {
      return res.status(404).json({
        status: "error",
        message: "Record not found",
      });
    }

    res.json({
      status: "success",
      data: {
        ...updatedDrive,
        id: updatedDrive._id.toString(),
      },
    });
  } catch (err) {
    console.error("Error updating blood drive:", err);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

// for updating NEED HELP table `answered` value
app.put("/api/need-help/answered", authMiddleware, async (req, res) => {
  const id = req.body.id;
  const answered = req.body.status;
  try {
    const updatedHelp = await NeedHelp.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { answered },
      { new: true }
    ).lean();

    if (!updatedHelp) {
      return res.status(404).json({
        status: "error",
        message: "Record not found",
      });
    }

    res.json({
      status: "success",
      data: {
        ...updatedHelp,
        id: updatedHelp._id.toString(),
      },
    });
  } catch (err) {
    console.error("Error updating help request:", err);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

// for updating NEW USERS table `checked` value
app.put("/api/new-users/checked", authMiddleware, async (req, res) => {
  const id = req.body.id;
  const checked = req.body.status;

  try {
    const updatedUser = await NewUsers.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { checked },
      { new: true }
    ).lean();

    if (!updatedUser) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.json({
      status: "success",
      data: {
        ...updatedUser,
        id: updatedUser._id.toString(),
      },
    });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

// ========================================

// UPDATING QUERIES FOR UPDATING RECORDS
// for updating NEED BLOOD table data
app.put("/api/need-blood/update/:id", async (req, res) => {
  const id = req.params.id;
  const { name, phone, bloodType, message } = req.body.updatedData;

  try {
    const result = await NeedBlood.findOneAndUpdate(
      {
        _id: new ObjectId(id),
      },
      { $set: { name, phone, email, bloodType, message } },
      { new: true }
    );

    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

// for updating HOST BLOOD DRIVE table data
app.put("/api/host-blood-drive/update/:id", async (req, res) => {
  const id = req.params.id;
  const { name, phone, institute, designation, city, message } =
    req.body.updatedData;

  try {
    const result = await HostBloodDrive.findOneAndUpdate(
      {
        _id: new ObjectId(id),
      },
      { $set: { name, phone, institute, designation, city, message } },
      { new: true }
    );

    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

// for updating NEED HELP table data
app.put("/api/need-help/update/:id", async (req, res) => {
  const id = req.params.id;
  const { name, phone, reason, message } = req.body.updatedData;

  try {
    const result = await NeedHelp.findOneAndUpdate(
      {
        _id: new ObjectId(id),
      },
      { $set: { name, phone, reason, message } },
      { new: true }
    );

    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

// ========================================

// // DELETING QUERIES

// for deleting NEED BLOOD table data
app.delete("/api/need-blood/delete/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const result = await NeedBlood.findOneAndDelete({
      _id: new ObjectId(id),
    });

    if (result) res.send(result);
    else res.status(404).send("Not Found");
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

// for deleting HOST BLOOD DRIVE table data
app.delete("/api/host-blood-drive/delete/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const result = await HostBloodDrive.findOneAndDelete({
      _id: new ObjectId(id),
    });

    if (result) res.send(result);
    else res.status(404).send("Not Found");
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

// for deleting NEED HELP table data
app.delete("/api/need-help/delete/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const result = await NeedHelp.findOneAndDelete({
      _id: new ObjectId(id),
    });

    if (result) res.send(result);
    else res.status(404).send("Not Found");
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

// for deleting NEW USERS table data
app.delete("/api/dashboard/:id", async (req, res) => {
  const id = req.params.id;

  try {
    // Check if user exists before deletion
    const user = await NewUsers.findById(id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    await NewUsers.findByIdAndDelete(id);

    // Get remaining users after deletion
    const remainingUsers = await NewUsers.find().lean();
    const formattedUsers = remainingUsers.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      phone: user.phone,
      email: user.email,
      date: user.date,
      source: user.source,
      checked: user.checked,
    }));

    res.json({
      status: "success",
      message: "User deleted successfully",
      data: formattedUsers,
    });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

// Update endpoint for editing users
app.put("/api/dashboard/:id", async (req, res) => {
  const id = req.params.id;
  const { name, phone, email, source } = req.body;

  try {
    const user = await NewUsers.findById(id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const updatedUser = await NewUsers.findByIdAndUpdate(
      id,
      { name, phone, email, source },
      { new: true }
    ).lean();

    // Get all users after update
    const allUsers = await NewUsers.find().lean();
    const formattedUsers = allUsers.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      phone: user.phone,
      email: user.email,
      date: user.date,
      source: user.source,
      checked: user.checked,
    }));

    res.json({
      status: "success",
      message: "User updated successfully",
      data: formattedUsers,
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
});

// Utility function for building dynamic queries
const buildQuery = (params) => {
  const query = { isActive: true };

  try {
    // Blood type filter
    if (params.bloodType) {
      query.availableBloodTypes = params.bloodType;
    }

    // Search filter (name or city)
    if (params.search) {
      const searchRegex = new RegExp(params.search, "i");
      query.$or = [{ name: searchRegex }, { city: searchRegex }];
    }

    // Location-based filter (if provided)
    if (params.lat && params.lng && params.radius) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(params.lng), parseFloat(params.lat)],
          },
          $maxDistance: parseInt(params.radius) * 1000, // Convert km to meters
        },
      };
    }

    return { query, error: null };
  } catch (error) {
    return { query: null, error: "Invalid query parameters" };
  }
};

// Error handler middleware
const errorHandler = (error, req, res, next) => {
  console.error("Error:", error);

  if (error.name === "ValidationError") {
    return res.status(400).json({
      status: "error",
      message: "Validation Error",
      details: Object.values(error.errors).map((err) => err.message),
    });
  }

  if (error.name === "MongoError" || error.name === "MongoServerError") {
    return res.status(500).json({
      status: "error",
      message: "Database Error",
      details: error.message,
    });
  }

  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
    details: error.message,
  });
};

// Get all blood banks with filtering
app.get("/api/blood-banks", async (req, res, next) => {
  try {
    console.log("Query params:", req.query);

    const { query, error } = buildQuery(req.query);

    if (error) {
      console.log("Query error:", error);
      return res.status(400).json({
        status: "error",
        message: error,
      });
    }

    const bloodBanks = await BloodBank.find(query)
      .select("-__v")
      .sort({ name: 1 });

    console.log("Found blood banks:", bloodBanks.length);

    res.json({
      status: "success",
      count: bloodBanks.length,
      data: bloodBanks,
    });
  } catch (err) {
    console.error("Server error:", err);
    next(err);
  }
});

// Add new blood bank (admin only)
app.post("/api/blood-banks", async (req, res, next) => {
  try {
    // TODO: Add admin authentication middleware
    const bloodBank = new BloodBank(req.body);
    const newBloodBank = await bloodBank.save();

    res.status(201).json({
      status: "success",
      data: newBloodBank,
    });
  } catch (err) {
    next(err);
  }
});

// Update blood bank
app.put("/api/blood-banks/:id", async (req, res, next) => {
  try {
    // TODO: Add admin authentication middleware
    const bloodBank = await BloodBank.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!bloodBank) {
      return res.status(404).json({
        status: "error",
        message: "Blood bank not found",
      });
    }

    res.json({
      status: "success",
      data: bloodBank,
    });
  } catch (err) {
    next(err);
  }
});

// Delete blood bank (soft delete)
app.delete("/api/blood-banks/:id", async (req, res, next) => {
  try {
    // TODO: Add admin authentication middleware
    const bloodBank = await BloodBank.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!bloodBank) {
      return res.status(404).json({
        status: "error",
        message: "Blood bank not found",
      });
    }

    res.json({
      status: "success",
      message: "Blood bank deactivated",
    });
  } catch (err) {
    next(err);
  }
});

// Debug route to check collection counts
app.get("/api/debug/counts", authMiddleware, async (req, res) => {
  try {
    const [donateBloodTotal, needBloodTotal, hostDriveTotal, needHelpTotal] =
      await Promise.all([
        DonateBlood.countDocuments(),
        NeedBlood.countDocuments(),
        HostBloodDrive.countDocuments(),
        NeedHelp.countDocuments(),
      ]);

    console.log("Total counts:", {
      donateBloodTotal,
      needBloodTotal,
      hostDriveTotal,
      needHelpTotal,
    });

    res.json({
      status: "success",
      counts: {
        donateBlood: donateBloodTotal,
        needBlood: needBloodTotal,
        hostDrive: hostDriveTotal,
        needHelp: needHelpTotal,
      },
    });
  } catch (err) {
    console.error("Error getting counts:", err);
    res.status(500).json({
      status: "error",
      message: "Error getting counts",
    });
  }
});

// Test data creation endpoint
app.post("/api/test/create-sample-data", authMiddleware, async (req, res) => {
  try {
    // Create a test user first
    const testUser = await NewUsers.create({
      name: "Test Hospital",
      email: "test@hospital.com",
      phone: "1234567890",
      source: "hospital",
      date: new Date(),
    });

    // Create sample blood drive hosts
    const hostDrives = await HostBloodDrive.create([
      {
        name: "John Hospital",
        email: "john@hospital.com",
        phone: "1234567890",
        institute: "City Hospital",
        designation: "Blood Bank Manager",
        city: "New York",
        message: "Annual blood donation camp",
        done: false,
      },
      {
        name: "Sarah Clinic",
        email: "sarah@clinic.com",
        phone: "9876543210",
        institute: "Community Clinic",
        designation: "Head Nurse",
        city: "Los Angeles",
        message: "Emergency blood drive",
        done: true,
      },
    ]);

    // Create sample blood donations
    const donations = await DonateBlood.create([
      {
        name: "Mike Donor",
        email: "mike@email.com",
        phone: "5551234567",
        bloodType: "A+",
        message: "Regular donor",
        donated: true,
      },
      {
        name: "Lisa Helper",
        email: "lisa@email.com",
        phone: "5559876543",
        bloodType: "O-",
        message: "First time donor",
        donated: false,
      },
    ]);

    // Create sample blood requests
    const requests = await NeedBlood.create([
      {
        userId: testUser._id,
        patientName: "James Patient",
        bloodType: "B+",
        units: 2,
        urgency: "urgent",
        hospital: "Emergency Hospital",
        location: "Chicago",
        contactNumber: "5552223333",
        status: "pending",
      },
      {
        userId: testUser._id,
        patientName: "Emma Recovery",
        bloodType: "AB-",
        units: 1,
        urgency: "normal",
        hospital: "Care Center",
        location: "Boston",
        contactNumber: "5554445555",
        status: "approved",
      },
    ]);

    // Create sample help requests
    const helpRequests = await NeedHelp.create([
      {
        name: "Help Center 1",
        email: "help1@center.com",
        phone: "5556667777",
        message: "Need volunteers for blood drive",
        done: false,
      },
      {
        name: "Support Group 2",
        email: "help2@group.com",
        phone: "5558889999",
        message: "Looking for blood donation awareness campaign support",
        done: true,
      },
    ]);

    res.json({
      status: "success",
      message: "Sample data created successfully",
      data: {
        testUser,
        hostDrives,
        donations,
        requests,
        helpRequests,
      },
    });
  } catch (error) {
    console.error("Error creating sample data:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Apply error handler middleware
app.use(errorHandler);

app.get("/", (req, res) => res.send("Welocome to motabari3!"));

app.listen(port, () => console.log(`Yee! app listening on port ${port}!`));

console.log("QRCode Model:", QRCode.modelName);

// Get all blood requests (admin only)
app.get("/api/blood-requests/all", async (req, res) => {
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
      bloodType: req.bloodType,
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

    // Format donor requests with consistent fields
    const formattedDonorRequests = donorRequests.map((req) => ({
      id: req._id.toString(),
      name: req.patientName || (req.userId && req.userId.name) || "Unknown",
      bloodType: req.bloodType,
      units: req.units || 1,
      urgency: req.urgency || "normal",
      status: req.status || (req.given ? "fulfilled" : "pending"),
      date: req.requestDate || req.createdAt,
      source: "donor",
      collection: "needbloods",
      contactNumber: req.contactNumber,
      hospital: req.hospital,
      location: req.location
    }));

    // Combine both sets of requests
    const allRequests = [...formattedHospitalRequests, ...formattedDonorRequests];

    // Sort by date (most recent first)
    allRequests.sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log("Sending all blood requests:", allRequests.length);
    
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
