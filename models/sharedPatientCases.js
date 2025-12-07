// models/DataShared.js
import mongoose from "mongoose";

const sharedPatientCasesSchema = new mongoose.Schema(
  {
    uniqueHealthIdentificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UHID",
      required: true,
    },
    referringDoctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    consulting_Doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // or "Doctor", whoever is creating this record
    },
    type: {
      type: String,
    },
    opdCaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OutpatientCase",
    },
    ipdCaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InpatientCase",
    },
    sharedAt: {
      type: Date,
      default: Date.now,
    },
    patientType: { type: String },
    companyName: { type: String },
    caseType: { type: String },
    ipdNumber: { type: String },
    wardMasterId: { type: mongoose.Schema.Types.ObjectId, ref: "WardMaster" },
    room_id: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    bed_id: { type: mongoose.Schema.Types.ObjectId, ref: "Bed" },
    height: { type: Number },
    weight: { type: Number },
    isDischarge: {
      type: Boolean,
      default: false,
    },
    isMedicalCase: { type: Boolean, default: false },
    medicoLegalCaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicoLegalCase",
    },
    admitDate: { type: Date },
    admitTime: { type: Date },
  },
  { timestamps: true }
);

const sharedpatientCase = mongoose.model(
  "sharedpatientCase",
  sharedPatientCasesSchema
);
export default sharedpatientCase;
