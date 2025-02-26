const mongoose = require("mongoose")

// Project schema
const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    startTime: { type: String, default: "" },
    endTime: { type: String, default: "" },
    page: { type: Boolean, default: false },
    repeat: { type: Boolean, default: false },
    days: { type: [String], default: [] }, // Array of days
    thirdParty: { type: Boolean, default: false },
    serviceName: { type: String, default: null },
    _id: { type: String, auto: true }
})

// Export the Activity model
const Activity = mongoose.model("Activity", projectSchema, "activities")

module.exports = Activity
