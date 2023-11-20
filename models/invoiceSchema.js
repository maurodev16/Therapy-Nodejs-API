const mongoose = require("mongoose");
const User = require("./userSchema");
const Appointment = require('./appointmentSchema');

// Invoices Schema
const invoiceSchema = new mongoose.Schema(
  { 
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    invoice_url: { type: String },
  },
  {
    timestamps: true,
  }
);

// Documents
const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;

