import dotenv from "dotenv";
dotenv.config();
import express from "express";
const router = express.Router();
import mongoose from "mongoose";
import User from "../models/userSchema.js";

// CREATE (C)
router.post("/create", async (req, res) => {
  const userData = req.body;

  try {
    // Check if the User's email is already in use
    const emailExists = await User.findOne({ email: userData.email });
    if (emailExists) {
      return res.status(422).json({ error: "EmailAlreadyExistsException" });
    }  
    const phoneExists = await User.findOne({ phone: userData.phone });
    if (phoneExists) {
      return res.status(422).json({ error: "PhoneAlreadyExistsException" });
    }
    const user = new User({
      first_name: userData.first_name,
      last_name: userData.last_name,
      phone: userData.phone,
      email: userData.email,
      password: userData.password,
      user_type: userData.user_type,
    });

    const newCreatedUser = await user.save();
    if (newCreatedUser) {
      user.client_number = newCreatedUser.client_number;
      return res.status(201).json({ newCreatedUser: newCreatedUser });
    }
  } catch (error) {
    console.error(`Error creating user: ${error}`);
    return res.status(500).json({ error: "ErroSignupOnDatabaseException" });
  }
});

// READ (R)
router.get("/fetch", async (req, res) => {
  try {
    const users = await User.find().sort({ client_number: 1 })
      .select("-__v")
      .select("-password");
    if (!users || users.length === 0) {
      return res.status(404).send("UserNotFoundException");
    }
    res.status(200).json({ userdata: users });
  } catch (error) {
    res.status(500).send(error);
  }
});

// UPDATE (U)
router.put("/update/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (req.body.email && req.body.email !== existingUser.email) {
      const emailInUse = await User.findOne({ email: req.body.email });
      if (emailInUse) {
        return res.status(400).json({ error: "Email is already in use" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ msg: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE (D)
router.delete("/delete/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    await User.deleteOne({ _id: userId });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
