const mongoose = require("mongoose")

// Project schema
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  access: { type: Number, required: true },
  notifications: [
    {
      _id: { type: String, required: true },
      name: { type: String, required: true }
    }
  ],
  userList: [
    {
      id: { type: String, required: true },
      access: { type: Number, required: true }
    }
  ],
  _id: { type: String, auto: true } // Ensures proper ObjectId creation
})

// Export the Project model
const Project = mongoose.model("Project", projectSchema, "projects")

module.exports = Project
