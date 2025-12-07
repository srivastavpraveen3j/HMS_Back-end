import mongoose from "mongoose";

const progressReportSchema = new mongoose.Schema(
  {
    uniqueHealthIdentificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UHID",
      required: [true, "UHID is required"],
    },
    inpatientCaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InpatientCase",
      // required: [true, 'Inpatient Case ID is required'],
    },
    DoctorName: { type: String, trim: true },
    Date: { type: Date, default: Date.now },
    Time: { type: String },
    vitals: {
      bloodGroup: {
        type: String,
        // required: [true, 'Blood group is required'],
      },
      weight: {
        type: Number,
        // required: [true, 'Weight is required'],
      },
      temperature: {
        type: Number,
        // required: [true, 'Temperature is required and must be at least 25'],
        // min: [25, 'Temperature is too low to be survivable'],
      },
      pulseRate: {
        type: Number,
        // required: [true, 'Pulse rate is required and must be at least 0'],
        // min: [0, 'Pulse rate cannot be negative'],
      },
      systolicBloodPressure: {
        type: Number,
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
        // min: [0, 'Respiratory rate cannot be negative'],
      },
      bloodSugar: {
        type: Number,
        // required: [true, 'Blood sugar is required and must be at least 0'],
      },
      spo2: {
        type: Number,
        // required: [true, 'SpO2 is required and must be at least 0'],
      },
    },

    diagnosisCase: { type: String, trim: true },
    treatment: { type: String, trim: true },
    advice: { type: String, trim: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

const ProgressReport = mongoose.model("ProgressReport", progressReportSchema);
export default ProgressReport;
