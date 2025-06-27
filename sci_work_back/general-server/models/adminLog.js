const mongoose = require("mongoose")

const adminLogSchema = new mongoose.Schema({
    
    timestamp: { type: Date, default: Date.now },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: String,
    targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    details: String // додаткові деталі
})

const AdminLog = mongoose.model("AdminLog", adminLogSchema, "adminLogs")

module.exports = AdminLog