const mongoose = require("mongoose")

// Project schema
const projectSchema = new mongoose.Schema({
    _id: { type: String },
    type: { type: String, default: "Dev" },
    name: { type: String, required: true },
    template: { type: String, default: "none" },
    content: { type: mongoose.Schema.Types.Mixed, required: false },
    activities: [
        {
        _id: { type: String, auto: true },
        path: { type: String, required: true },
        dnd: { type: Number, required: true },
        name: { type: String, required: true },
        startDate: { type: String, required: true },
        endDate: { type: String, required: true },
        startTime: { type: String, default: "00:00" },
        endTime: { type: String, default: "00:00" },
        page: { type: Boolean, default: false },
        repeat: { type: Boolean, default: false },
        days: { type: [String], default: [] },
        thirdParty: { type: Boolean, default: false },
        serviceName: { type: String, default: null }
        }
    ],
    userList: [
        {
            id: { type: String, required: true },
            access: { type: Number, required: true }
        }
    ]
})

// Export the Activity model
const Activity = mongoose.model("Activity", projectSchema, "activities")

module.exports = Activity