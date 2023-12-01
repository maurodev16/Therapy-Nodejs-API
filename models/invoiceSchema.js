import mongoose from "mongoose";
import User from "../models/userSchema.js";
import Appointment from "../models/appointmentSchema.js";


// Invoices Schema
const invoiceSchema = new mongoose.Schema(
  {
    user_obj: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    appointment_obj: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    invoice_url: { type: String },
    over_duo: { type: Date },
    create_by: { type: String },
    status: {
      type: String,
      enum: ["open", "pending", "completed", "overduo"],
      default: "open",
    },
  },
  {
    timestamps: true,
  }
);

// Documents
const Invoice = mongoose.model("Invoice", invoiceSchema);

export default  Invoice;
