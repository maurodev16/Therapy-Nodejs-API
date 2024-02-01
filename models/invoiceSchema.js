import mongoose from "mongoose";
import User from "../models/userSchema.js";
import Appointment from "../models/appointmentSchema.js";

// Define the schema for invoices
const invoiceSchema = new mongoose.Schema(
  {
    user_obj: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    appointment_obj: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment", // Reference to the Appointment model
      required: true,
    },
    invoice_url: { type: String }, // URL of the invoice
    invoice_name: { type: String }, // Name of the invoice
    over_due: { type: Date }, // Date when the invoice is overdue
    created_by: { type: String }, // Creator of the invoice
    status: {
      type: String,
      enum: ["open", "paid", "refunded", "overdue"], // Possible statuses of the invoice
      default: "open", // Default status is set to "open"
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Define the Invoice model based on the invoiceSchema
const Invoice = mongoose.model("Invoice", invoiceSchema);

// Export the Invoice model
export default Invoice;
