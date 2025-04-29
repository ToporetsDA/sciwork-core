const mongoose = require("mongoose")

// Project schema
const projectSchema = new mongoose.Schema({
  _id: { type: String, auto: true }, // Ensures proper ObjectId creation
  name: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  access: { type: Number, required: true },
  name: { type: String, required: true },
  activities: [
    {
      _id: { type: String, auto: true },
      startDate: { type: String, required: true },
      endDate: { type: String, required: true },
      startTime: { type: String, default: "" },
      endTime: { type: String, default: "" },
      page: { type: Boolean, default: false },
      repeat: { type: Boolean, default: false },
      days: { type: [String], default: [] }, // Array of days
      thirdParty: { type: Boolean, default: false },
      serviceName: { type: String, default: null }
    }
  ],
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
  ]
})

// Export the Project model
const Project = mongoose.model("Project", projectSchema, "projects")

module.exports = Project
