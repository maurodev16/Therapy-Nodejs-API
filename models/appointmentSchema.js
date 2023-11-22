const mongoose = require("mongoose");
const User = require("./userSchema");
const Invoice = require("./invoiceSchema");
const ServiceType = require("./serviceSchema");

// Therapy Session Schema
const appointmentSchema = new mongoose.Schema(
  {
    date: { type: Date, index: true, required: true },
    time: { type: Date, index: true, required: true },
    notes: { type: String },
    user_obj: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service_type_obj: [
      { type: mongoose.Schema.Types.ObjectId, ref: "ServiceType" },
    ],
    status: {
      type: String,
      enum: ["open", "done", "canceled"],
      default: "open",
    },
    canceled_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

// Adiciona um índice composto para date e time
appointmentSchema.index({ date: 1, time: 1 });

// Therapy Appointment Model
const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;
