import dotenv from "dotenv";
import express from "express";
import User from "../models/userSchema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

dotenv.config();
const router = express.Router();

const BCRYPT_SALT = process.env.BCRYPT_SALT; // Salt value for bcrypt hashing
const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY; // Secret key for JWT token

/// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate user data
    if (!email) {
      return res.status(422).send("Please provide a valid email!");
    }

    let user;

    // Check if the provided email is in valid format
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Find user by email
    if (isEmail) {
      user = await User.findOne({ email: email });
    } else {
      // If email is not in valid format, try to find user by partial email match
      user = await User.findOne({
        email: { $regex: `^${email}`, $options: "i" },
      });
    }

    // If no user found with the provided email
    if (!user) {
      return res.status(404).send("No user found with this email!");
    }

    // Validate password presence
    if (!password) {
      return res.status(422).json("Password is required!");
    }

    // Verify if the provided password matches the hashed password stored in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(422).json("Incorrect password");
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        _id: user._id,
        user_type: user.user_type,
        client_number: user.client_number,
      },
      AUTH_SECRET_KEY,
      {
         expiresIn: "1h", // Token expiration time (if needed)
      }
    );

    // Return user information and authentication token
    return res.status(200).json({
      _id: user._id,
      client_number: user.client_number,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      user_type: user.user_type,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      token,
    });
  } catch (error) {
    // Handle any errors that occur during login process
    console.error(error);
    return res.status(500).send("An error occurred during login.");
  }
});

export default router;
