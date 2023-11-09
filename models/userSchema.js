const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();
const bcryptSalt = process.env.BCRYPT_SALT;

const userSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "client"], required: true },
    is_admin: { type: Boolean },
  },
  {
    timestamps: true,
  }
);

/// PRE SAVE
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const hash = await bcrypt.hash(this.password, Number(bcryptSalt));
    this.password = hash;
  }

  next();
});

const User = mongoose.model("User", userSchema);

module.exports = { User };
