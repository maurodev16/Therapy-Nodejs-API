const mongoose = require("mongoose");
const User = require("../models/userSchema");
const Session = require("../models/sessionSchema");

// Payment Schema
const paymentSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  session: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
  due_date: { type: Date },
  payment_status: { type: String },
  amount: { type: Number },
  payment_method: { type: String },
  transaction_number: { type: String },
});

// Payment Model
const Payment = mongoose.model("Payment", paymentSchema);

module.exports = { Payment };
