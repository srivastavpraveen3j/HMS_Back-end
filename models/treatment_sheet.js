import mongoose from "mongoose";

const treatmentSheetSchema = new mongoose.Schema({
  uniqueHealthIdentificationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UHID",
    required: [true, "UHID is required"],
  },
  inpatientCaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InpatientCase",
    default: null,
    set: (v) => (v === "" ? null : v),
  },
  drug: { type: String },
  dose: { type: String },
  route: { type: String },
  frequency: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, {
    timestamps: true,
});

const TreatmentSheet = mongoose.model("TreatmentSheet", treatmentSheetSchema);
export default TreatmentSheet;
