const mongoose = require("mongoose");
const User = require("./userSchema");
const Document = require("./documentSchema");
const ServiceType = require("./serviceSchema");

// Therapy Session Schema
const sessionSchema = new mongoose.Schema({
  day: { type: Date },
  time: { type: Date },
  notes: { type: String },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  service_type_id: [{ type: mongoose.Schema.Types.ObjectId, ref: "ServiceType" }],
  related_documents_id: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Document" },
  ],
  is_canceled: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["open", "done", "canceled"],
    default: "open",
  },
},
{
  timestamps: true,
});

// Therapy Session Model
const Session = mongoose.model("Session", sessionSchema);

module.exports = { Session };
