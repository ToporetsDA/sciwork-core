const mongoose = require("mongoose")

// Project schema
const projectSchema = new mongoose.Schema({
  _id: { type: String },
  dndCount: { type: Number, required: true },
  name: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  deleted: { type: Boolean, required: false },
  activities: [
    {
      _id: { type: String, auto: true },
      dnd: { type: Number, required: true },
      type: { type: String, default: "Dev" },
      name: { type: String, required: true },
      startDate: { type: String, required: true },
      endDate: { type: String, required: true },
      isTimed: { type: Boolean, default: false},
      startTime: { type: String, default: "00:00" },
      endTime: { type: String, default: "00:00" },
      repeat: { type: Boolean, default: false },
      days: { type: [String], default: [] },
      thirdParty: { type: Boolean, default: false },
      serviceName: { type: String, default: null },
      deleted: { type: Boolean, required: false },
      userList: [
        {
          id: { type: String, required: true },
          access: { type: Number, required: true }
        }
      ],
      activities: { type: mongoose.Schema.Types.Mixed, default: [] }
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
