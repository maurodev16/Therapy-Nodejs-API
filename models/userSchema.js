import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Invoice from "../models/invoiceSchema.js";
import Appointment from "../models/appointmentSchema.js";
import dotenv from "dotenv";
dotenv.config();

// Load environment variables
const bcryptSalt = process.env.BCRYPT_SALT;

// Define the schema for users
const userSchema = new mongoose.Schema(
  {
    client_number: { type: Number, unique: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    user_type: { type: String, enum: ["admin", "client"] },
  },
  {
    timestamps: true,
  }
);

// Middleware to execute before saving a user document
userSchema.pre("save", async function (next) {
  if (!this.isNew) {
    return next();
  }

  // Query the last client_number in the database
  const lastClient = await mongoose
    .model("User", userSchema)
    .findOne({}, { client_number: 1 }, { sort: { client_number: -1 } })
    .lean();

  // Generate a new client_number by incrementing the last obtained number
  const newClientNumber = (lastClient?.client_number || 99) + 1;
  this.client_number = newClientNumber;

  // Ensure user_id is unique and not null
  if (!this._id) {
    this._id = new mongoose.Types.ObjectId();
  }

  // Hash the password if it has been modified
  if (this.isModified("password")) {
    const hash = await bcrypt.hash(this.password, Number(bcryptSalt));
    this.password = hash;
  }

  next();
});

// Define the User model based on the userSchema
const User = mongoose.model("User", userSchema);

// Export the User model
export default User;
