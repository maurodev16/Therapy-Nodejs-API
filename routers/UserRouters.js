const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/userSchema");

// CREATE (C)
router.post("/create", async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  try {
    // Verifica se o email do User já está em uso
    const emailExists = await User.findOne({ email: email });
    if (emailExists) {
      return res.status(422).send("EmailAlreadyExistsException");
    }

    const user = new User({
      first_name: first_name,
      last_name: last_name,
      email: email,
      password: password,
    });

    const newCreatedUser = await user.save({ user });
    console.log(newCreatedUser);

    if (!newCreatedUser) {
      return Error("ErroSignupOnDatabaseException");
    }

    return res.status(201).json({ newCreatedUser });
  } catch (error) {
    return res.status(500).send("ErroSignupException");
  }
});

// READ (R)
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE (U)
router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE (D)
router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndRemove(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
