const mongoose = require("mongoose");
const User = require("../models/userSchema");

// Payment Schema
const paymentSchema = new mongoose.Schema({
  user_obj: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  due_date: { type: Date },
  is_storned: { type: Boolean, default: false },
  payment_status: {
    type: String,
    enum: ["open", "payed", "storned"],
    default: "open",
  },
  amount: { type: Number },
  payment_method: { type: String },
  transaction_number: { type: String },
});

// Payment Model
const Payment = mongoose.model("Payment", paymentSchema);

module.exports = { Payment };
