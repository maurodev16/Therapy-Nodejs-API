require('dotenv').config();
const router = require('express').Router();
const User = require("../models/userSchema");

// CREATE (C)
router.post("/create", async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  try {
    // Verifica se o email do User já está em uso
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(422).json({ error: "EmailAlreadyExistsException" });
    }

    const user = new User({
      first_name,
      last_name,
      email,
      password,
    });

    const newCreatedUser = await user.save();

    if (!newCreatedUser) {
      return res.status(500).json({ error: "ErroSignupOnDatabaseException" });
    }

    return res.status(201).json({ newCreatedUser });
  } catch (error) {
    console.error(`Erro to create user: ${error}`);
    return res.status(500).json({ error: "InternalServerError" });
  }
});

// READ (R)
router.get('/fetch',  async (req, res) => {///checkToken,
  try {
    const users = await User.find().select('-password');

    if (!users) {
      return res.status(404).send("UserNotFoundException");
    }

    const userdata = users.map(user => {
      return {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    })
    res.status(200).send(userdata)
  } catch (error) {
    res.status(500).send(error)
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
