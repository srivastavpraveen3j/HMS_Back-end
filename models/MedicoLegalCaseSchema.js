import mongoose from "mongoose";
import Counter from "./counter.js"; // adjust path if needed

const MedicoLegalCaseSchema = new mongoose.Schema({
  uniqueHealthIdentificationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UHID",
  },
  caseType: { type: String, enum: ["outpatient", "inpatient"] },
  medicoLegalCaseNumber: {
    type: Number,
    unique: true, // optional but prevents duplicates
  },
  medicoLegalDocumentName: { type: String },
  policeInformerFullName: { type: String },
  responsibleRelativeFullName: { type: String },
  police_station_location: { type: String },
  treatingDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  informationReportedDate: { type: Date },
  bucket_number: { type: String },
  aadharNumber: { type: Number },
  panCardNumber: { type: String },
  emailAddress: { type: String },
  mobileNumber: { type: Number },
  ReportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

MedicoLegalCaseSchema.pre("save", async function (next) {
  if (this.isNew && !this.medicoLegalCaseNumber) {
    const counterDoc = await Counter.findOneAndUpdate(
      { module: "MedicoLegalCase" },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    this.medicoLegalCaseNumber = counterDoc.value;
  }
  next();
});

export default mongoose.model("MedicoLegalCase", MedicoLegalCaseSchema);