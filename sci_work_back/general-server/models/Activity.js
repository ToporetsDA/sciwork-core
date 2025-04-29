const mongoose = require("mongoose")

// Project schema
const projectSchema = new mongoose.Schema({
    _id: { type: String, auto: true },
    name: { type: String, required: true },
    template: { type: String, default: "none" },
    content: { type: String, required: false }
})

// Export the Activity model
const Activity = mongoose.model("Activity", projectSchema, "activities")

module.exports = Activity
