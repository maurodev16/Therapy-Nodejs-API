require("dotenv").config();
const router = require("express").Router();
const User = require("../models/userSchema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const mongoose = require("mongoose");
const BCRYPT_SALT = process.env.BCRYPT_SALT;
const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY;

/// Login route
router.post("/login", async (req, res) => {
    try {
      const { clientNumberOrEmail, password } = req.body;
  
      // Validate User data
      if (!clientNumberOrEmail) {
        return res.status(422).send("Please provide a valid email or client number!");
      }
  
      let user;
  
   
    // Find user using email or client_number
    if (!isNaN(clientNumberOrEmail)) {
        // Se o valor é um número, considere-o como client_number
        user = await User.findOne({ client_number: clientNumberOrEmail });
      } else {
        // Se não for um número, considere-o como email
        user = await User.findOne({
          email: { $regex: `^${clientNumberOrEmail}`, $options: "i" },
        });
      }
  
      if (!user) {
        return res.status(404).send("No user found with this email or client_number!");
      }
  
      if (!password) {
        return res.status(422).json("Password is required!");
      }
  
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (!isPasswordValid) {
        return res.status(422).json("Incorrect password");
      }
  
      // Generate token
      const token = jwt.sign(
        {
          user_id: user.user_id,
          user_type: user.user_type,
          client_number: user.client_number,
        },
        AUTH_SECRET_KEY,
        {
          expiresIn: "1h", // Token expiration time
        }
      );
  
      // Return the authentication token and user information
      return res.status(200).json({
        user_id: user.user_id,
        client_number: user.client_number,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        user_type: user.user_type,
        token,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send("An error occurred during login.");
    }
  });  
  
  module.exports = router;
  
