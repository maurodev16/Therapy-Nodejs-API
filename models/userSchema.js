// models/user.js

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const AutoIncrement = require("mongoose-sequence")(mongoose);
require("dotenv").config();
const bcryptSalt = process.env.BCRYPT_SALT;

const userSchema = new mongoose.Schema(
  {
    user_number: { type: Number, unique: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Use o plugin mongoose-sequence para gerar automaticamente um número sequencial
userSchema.plugin(AutoIncrement, { inc_field: "user_number" });

// PRE SAVE
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const hash = await bcrypt.hash(this.password, Number(bcryptSalt));
    this.password = hash;
  }

  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
