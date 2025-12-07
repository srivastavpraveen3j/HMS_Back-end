import mongoose from "mongoose";

const vitalsSchema = new mongoose.Schema({
  uhid: {
    type: String,
  },
  uniqueHealthIdentificationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UHID",
    required: [true, "UHID is required"],
  },
  inpatientCaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InpatientCase",
    default: null,
    set: (v) => (v === "" ? null : v), // 👈 convert empty string to null
  },
  outpatientCaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OutpatientCase",
    default: null,
    unique: true,
    set: (v) => (v === "" ? null : v), // 👈 convert empty string to null
  },
  temperature: {
    type: Number,
    // required: [true, 'Temperature is required and must be at least 25'],
    min: [25, "Temperature is too low to be survivable"],
  },
  pulseRate: {
    type: Number,
    // required: [true, 'Pulse rate is required and must be at least 0'],
    min: [0, "Pulse rate cannot be negative"],
  },
  systolicBloodPressure: {
    type: String,
    // required: [true, 'Systolic BP is required and must be at least 0'],
    // min: [0, 'Systolic BP cannot be negative'],
  },
  diastolicBloodPressure: {
    type: Number,
    // required: [true, 'Diastolic BP is required and must be at least 0'],
    // min: [0, 'Diastolic BP cannot be negative'],
  },
  respiratoryRate: {
    type: Number,
    // required: [true, 'Respiratory rate is required and must be at least 0'],
    min: [0, "Respiratory rate cannot be negative"],
  },
  bloodSugar: {
    type: Number,
    // required: [true, 'Blood sugar is required and must be at least 0'],
  },
  spo2: {
    type: Number,
    // required: [true, 'SpO2 is required and must be at least 0'],
  },

  // 🧴 Intake fields
  oralRtf: {
    type: String,
    trim: true,
    maxlength: [100, "Oral/RTF description too long"],
  },
  ivStarted: {
    type: String,
    trim: true,
    maxlength: [100, "IV Started description too long"],
  },
  ivInfused: {
    type: String,
    trim: true,
    maxlength: [100, "IV Infused description too long"],
  },

  // 💧 Output fields
  urine: {
    type: String,
    trim: true,
    maxlength: [100, "Urine description too long"],
  },
  emesisRta: {
    type: String,
    trim: true,
    maxlength: [100, "Emesis/RTA description too long"],
  },
  drain: {
    type: String,
    trim: true,
    maxlength: [100, "Drain description too long"],
  },
  stool: {
    type: String,
    trim: true,
    maxlength: [100, "Stool description too long"],
  },
  
  remarks: {
    type: String,
    trim: true,
    maxlength: [500, "Remarks should not exceed 500 characters"],
  },
  input: {
    type: String,
    trim: true,
    maxlength: [100, "Input description too long"],
  },
  output: {
    type: String,
    trim: true,
    maxlength: [100, "Output description too long"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Vitals = mongoose.model("Vitals", vitalsSchema);
export default Vitals;
