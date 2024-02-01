import mongoose from "mongoose";

// Define the schema for therapy service types
const serviceSchema = new mongoose.Schema({
  name: { type: String }, // Name of the therapy service type
  notes: { type: String }, // Additional notes for the service type
});

// Define the ServiceType model based on the serviceSchema
const ServiceType = mongoose.model("ServiceType", serviceSchema);

// Export the ServiceType model
export default ServiceType;
