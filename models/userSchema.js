const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { async } = require("@firebase/util");
require("dotenv").config();
const bcryptSalt = process.env.BCRYPT_SALT;

const userSchema = new mongoose.Schema(
  {
    user_id :{ type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// PRÉ-SAVE
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const hash = await bcrypt.hash(this.password, Number(bcryptSalt));
    this.password = hash;
  }

 
});

const User = mongoose.model("User", userSchema);

module.exports = User;
