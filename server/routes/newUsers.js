import express from "express";
import { NewUsers } from "../models/newUsers.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

// Get all new users
router.get("/all", async (req, res) => {
  try {
    const users = await NewUsers.find().sort({ createdAt: -1 });
    res.json({
      status: "success",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Update user
router.put("/:id", async (req, res) => {
  try {
    console.log("Update request for ID:", req.params.id);
    console.log("Update data:", req.body);

    const { name, phone, email, source } = req.body;

    const updatedUser = await NewUsers.findByIdAndUpdate(
      req.params.id,
      {
        $set: { name, phone, email, source },
      },
      { new: true }
    ).lean();

    if (!updatedUser) {
      console.log("User not found for update");
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Format the user data
    const formattedUser = {
      id: updatedUser._id.toString(),
      name: updatedUser.name,
      phone: updatedUser.phone,
      email: updatedUser.email,
      date: updatedUser.date,
      source: updatedUser.source,
      checked: updatedUser.checked,
    };

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

    console.log("User updated successfully:", formattedUser);
    res.json({
      status: "success",
      message: "User updated successfully",
      data: formattedUsers,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
  try {
    console.log("Delete request for ID:", req.params.id);

    const deletedUser = await NewUsers.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      console.log("User not found for deletion");
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Get remaining users after deletion
    const remainingUsers = await NewUsers.find().sort({ createdAt: -1 }).lean();

    // Format the remaining users
    const formattedUsers = remainingUsers.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      phone: user.phone,
      email: user.email,
      date: user.date,
      source: user.source,
      checked: user.checked,
    }));

    console.log("User deleted successfully:", deletedUser);
    res.json({
      status: "success",
      message: "User deleted successfully",
      data: formattedUsers,
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

export default router;
