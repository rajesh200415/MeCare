const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  patientId: { type: String, unique: true }, // Add patientId field
  healthDetails: {
    weight: { type: String },
    height: { type: String },
    bloodGroup: { type: String },
    allergies: { type: String },
    medicalHistory: { type: String },
  },
  appointments: [
    {
      date: { type: Date },
      doctor: { type: String },
      status: { type: String },
    },
  ],
  encounters: [
    {
      date: { type: Date },
      description: { type: String },
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
