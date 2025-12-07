// models/TriageAssessment.model.js
import mongoose from "mongoose";
import { Schema } from "mongoose";

const TriageAssessmentSchema = new Schema(
  {
    outpatientCase: {
      type: Schema.Types.ObjectId,
      ref: "OutpatientCase",
      required: true,
      index: true,
    },
    vitals: {
      type: Schema.Types.ObjectId,
      ref: "Vitals",   // link instead of duplicate
      required: true,
    },
    modifiers: {
      ageInYears: Number,
      isPregnant: Boolean,
      comorbidities: [String],
      hasInfectionRedFlags: Boolean,
      hasChestPain: Boolean,
      hasActiveSeizure: Boolean,
      hasSevereDyspnea: Boolean,
      hasMassiveBleeding: Boolean,
    },
    result: {
      totalScore: { type: Number, required: true },
      priorityLevel: {
        type: String,
        enum: ["Critical", "High", "Medium", "Low"],
        required: true,
        index: true,
      },
      priorityIcon: { type: String }, // 🚨 ⚠️ ⏳ 🙂
      reasoning: [String],
      isOverride: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// module.exports = mongoose.model("TriageAssessment", TriageAssessmentSchema);
export default mongoose.model("TriageAssessment", TriageAssessmentSchema);