import mongoose from "mongoose";

// Define the schema for tasks
const taskSchema = new mongoose.Schema(
  {
    // Name of the task
    task_name: { type: String }, 
    // Additional notes for the task
    notes: { type: String }, 
    // Priority level of the task
    priority: {
      type: String,
      enum: ["low", "medium", "high"], 
      default: "medium", // Default priority is set to medium
    },
    status: {
      type: String,
      enum: ["to_do", "in_progress", "completed", "delayed"], // Status of the task
      default: "to_do", // Default status is set to "to_do"
    },
    completionDate: { type: Date }, // Date when the task is completed
  },
  {
    comments: [
      {
        author: String, // Name or identifier of the comment author
        content: String, // Content of the comment
        timestamp: Date, // Timestamp of the comment
      },
    ],
    // Automatically adds createdAt and updatedAt fields
    timestamps: true, 
  }
);

// Define the Task model based on the taskSchema
const Task = mongoose.model("Task", taskSchema);

// Export the Task model
export default Task;
