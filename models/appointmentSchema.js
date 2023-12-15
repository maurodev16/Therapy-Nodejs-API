import mongoose from "mongoose";
import User from "./userSchema.js";
import Invoice from "./invoiceSchema.js";
import ServiceType from "./serviceSchema.js";

// Therapy Session Schema
const appointmentSchema = new mongoose.Schema(
  {
    date: { type: Date, index: true, required: true },
    time: { type: Date, index: true, required: true },
    notes: { type: String },
    invoice_obj: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Invoice", default: [] },
    ],
    invoice_qnt: { type: Number, default: 0 },
    user_obj: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service_type_obj: [
      { type: mongoose.Schema.Types.ObjectId, ref: "ServiceType",  default: null, },
    ],
    status: {
      type: String,
      enum: ["open", "done", "canceled"],
      default: "open",
    },
    canceled_by: {
      type: mongoose.Schema.Types.ObjectId, ref: "User", default: null,  },
  },
  {
    timestamps: true,
  }
);

// Add a compound index for date and time
appointmentSchema.index({ date: 1, time: 1 });

// Therapy Appointment Model
const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
