const mongoose = require("mongoose");
const User = require("./userSchema");
const Document = require("./documentSchema");
const ServiceType = require("./serviceSchema");
const Payment = require("./paymentSchema");

// Therapy Session Schema
const sessionSchema = new mongoose.Schema({
  day: { type: Date },
  time: { type: Date },
  notes: { type: String },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  service_type_id: [{ type: mongoose.Schema.Types.ObjectId, ref: "ServiceType" }],
  Payment_id: [{ type: mongoose.Schema.Types.ObjectId, ref: "Payment" }],
  related_documents_id: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Document" },
  ],
  is_canceled: { type: Boolean, default: false },//regra para que uma session possa ser estornada é de 48 horas
  status: {
    type: String,
    enum: ["open", "done"], 
    default: "open",
  },
},
{
  timestamps: true,
});

// Therapy Session Model
const Session = mongoose.model("Session", sessionSchema);

module.exports = Session ;
