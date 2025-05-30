const mongoose = require("mongoose")

// Project schema
const projectSchema = new mongoose.Schema({
    _id: { type: String },
    name: { type: String, required: true },
    template: { type: String, default: "none" },
    content: { type: mongoose.Schema.Types.Mixed, required: false }
})

// Export the Activity model
const Activity = mongoose.model("Activity", projectSchema, "activities")

module.exports = Activity