const mongoose = require("mongoose")

// Organisation schema
const organisationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rights: {
    fullView: { type: [Number], required: true }, // Array of numbers
    interact: { type: [Number], required: true },
    edit: { type: [Number], required: true }
  },
  dataTypes: { type: [String], required: true },
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true } // Ensures proper ObjectId creation
})

// Export the Organisation model
const Organisation = mongoose.model("Organisation", organisationSchema, "organisations")

module.exports = Organisation
