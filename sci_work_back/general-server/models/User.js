const mongoose = require("mongoose")
const Joi = require("joi") // Validation schema

// Full user schema to match your expected structure
const userSchema = new mongoose.Schema({
  _id: { type: String },
  name: { type: String, required: true },
  middleName: { type: String, default: "" },
  surName: { type: String, required: true },
  patronimic: { type: String, default: "" },
  statusName: { type: String, required: true },
  genStatus: { type: Number, required: true },
  mail: { type: String, required: true },
  safetyMail: { type: String, default: "" },
  phone: { type: String, default: "" },
  safetyPhone: { type: String, default: "" },
  currentSettings: {
    sortFilter: { type: String, default: "A-Z" },
    statusFilter: { type: String, default: "all" },
    displayProjects: { type: String, default: "grid" },
    notificationsPeriod: {type: Number, default: 5},
    notificationsDelay: {type: Number, default: 15}
  },
  login: { type: String, required: true, unique: true },
  password: { type: String, required: true }
})

// Export the user model
const User = mongoose.model("User", userSchema, "users")

// Validation function
/*const validateUser = (userData) => {
  return userValidationSchema.validate(userData);
};*/

module.exports = User
