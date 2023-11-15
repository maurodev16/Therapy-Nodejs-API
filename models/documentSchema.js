const mongoose = require("mongoose");
const User = require("../models/userSchema");

// Documents Schema
const documentSchema = new mongoose.Schema({
  user_obj: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  documen_name: { type: String },
  send_date: { type: Date },
  document_type: { type: String },
  file_path: { type: String },
});

// Documents
const Document = mongoose.model("Document", documentSchema);

module.exports = { Document };
