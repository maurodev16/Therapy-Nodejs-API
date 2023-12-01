import mongoose from "mongoose";


const taskSchema = new mongoose.Schema(
  {
    task_name: { type: String },
    notes: { type: String },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["to_do", "in_progress", "completed", "delayed"],
      default: "to_do",
    },
    completionDate: { type: Date },
  },
  {
    comments: [
      {
        author: String, // Nome ou identificador do autor do comentário
        content: String, // Conteúdo do comentário
        timestamp: Date, // Marca de tempo do comentário
      },
    ],
    timestamps: true,
  }
);

// Therapy Task Model
const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
