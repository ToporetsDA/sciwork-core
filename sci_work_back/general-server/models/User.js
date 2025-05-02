const mongoose = require("mongoose")
const Joi = require("joi") // Validation schema

// Full user schema to match your expected structure
const userSchema = new mongoose.Schema({
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
  },
  login: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  _id: { type: String, auto: true },
  notificationsPeriod: {type: Number, default: 5},
  notificationsDelay: {type: Number, default: 15}
})

// Validation schema with Joi
/*const userValidationSchema = Joi.object({
  name:             Joi.string().required(),
  middleName:       Joi.string().allow(""),
  surName:          Joi.string().required(),
  patronimic:       Joi.string().allow(""),
  statusName:       Joi.string().required(),
  genStatus:        Joi.number().integer().required(),
  mail:             Joi.string().email().required(),
  safetyMail:       Joi.string().email().allow(""),
  phone:            Joi.string().allow(""),
  safetyPhone:      Joi.string().allow(""),
  currentSettings:  Joi.object({
    sortFilter:     Joi.string().default("A-Z"),
    statusFilter:   Joi.string().default("all"),
  }).default(),
  login:            Joi.string().required(),
  password:         Joi.string().required(),
});*/

// Export the user model
const User = mongoose.model("User", userSchema, "users")

// Validation function
/*const validateUser = (userData) => {
  return userValidationSchema.validate(userData);
};*/

module.exports = User
