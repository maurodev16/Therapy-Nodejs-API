const mongoose = require("mongoose");
const User = require("./userSchema");
const Document = require("./documentSchema");

// Therapy Session Schema
const sessionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  day: { type: Date },
  time: { type: Date },
  status: { type: String },
  notes: { type: String },
  related_documents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }],
});

// Therapy Session Model
const Session = mongoose.model("Session", sessionSchema);

module.exports = { Session };
