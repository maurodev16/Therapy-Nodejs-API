import mongoose from "mongoose";
// Therapy Service type Schema
const serviceSchema = new mongoose.Schema({
  name: { type: String },
  notes: { type: String },
});

// Therapy Service Type Model
const ServiceType = mongoose.model("ServiceType", serviceSchema);

export default  ServiceType ;
