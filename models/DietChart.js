// models/DietChart.js
import mongoose from "mongoose";

const DietItemSchema = new mongoose.Schema({
  time: {
    type: String,
    // required: true,
    enum: ["breakfast", "lunch", "evening_snack", "dinner", "night_snack"]
  },
  items: [{
    name: { type: String, required: true },
    quantity: { type: String },
    instructions: { type: String }
  }],
  specialInstructions: { type: String }
}, { timestamps: true });

const DietChartSchema = new mongoose.Schema({
  bedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bed",
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UHID",
    required: true
  },
  inpatientCaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InpatientCase",  // Make sure this matches your model name
    required: true
  },
  dietDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  dietType: {
    type: String,
    enum: ["normal", "diabetic", "cardiac", "renal", "liquid", "soft", "npom"],
    default: "normal"
  },
  meals: [DietItemSchema],
  totalCalories: { type: Number },
  waterIntake: { type: String },
  restrictions: [{ type: String }],  // Array of strings
  allergies: [{ type: String }],     // Array of strings
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  remarks: { type: String }
}, { timestamps: true });

const DietChart = mongoose.model("DietChart", DietChartSchema);
export default DietChart;
