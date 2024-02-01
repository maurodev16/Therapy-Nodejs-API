import mongoose from "mongoose";
import User from "./userSchema.js";
import Invoice from "./invoiceSchema.js";
import ServiceType from "./serviceSchema.js";

// Define the schema for therapy sessions (appointments)
const appointmentSchema = new mongoose.Schema(
  {
    date: { type: Date, index: true, required: true }, // Date of the appointment
    time: { type: Date, index: true, required: true }, // Time of the appointment
    notes: { type: String }, // Additional notes for the appointment
    invoice_obj: [
      // Array of invoice references associated with the appointment
      { type: mongoose.Schema.Types.ObjectId, ref: "Invoice", default: [] },
    ],
    invoice_qnt: { type: Number, default: 0 }, // Quantity of invoices associated with the appointment
    user_obj: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model representing the user who booked the appointment
      required: true,
    },
    service_type_obj: [
      // Array of service type references associated with the appointment
      { type: mongoose.Schema.Types.ObjectId, ref: "ServiceType", default: null },
    ],
    status: {
      type: String,
      enum: ["open", "done", "canceled"], // Possible statuses of the appointment
      default: "open", // Default status is set to "open"
    },
    canceled_by: { type: String, default: "" }, // Indicates who canceled the appointment
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Add a compound index for date and time for efficient querying
appointmentSchema.index({ date: 1, time: 1 });

// Define the Appointment model based on the appointmentSchema
const Appointment = mongoose.model("Appointment", appointmentSchema);

// Export the Appointment model
export default Appointment;
