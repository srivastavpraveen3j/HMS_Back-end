// models/VisitMaster.js
import mongoose from "mongoose";

const VisitMasterSchema = new mongoose.Schema(
  {
    headName: {
      type: String,
      required: [true, "Head name is required"],
      trim: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: [true, "Doctor is required"],
    },

    // For purely manual entries (doctor not from Doctor collection)
    isManualEntry: {
      type: Boolean,
      default: false,
    },
    manualDoctorName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      trim: true,
    },
    manualDoctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      trim: true,
    },
    manualDoctorMobile: {
      type: String,
      trim: true,
    },
    inpatientCaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InpatientCase",
      required: [true, "Inpatient case is required"],
    },
    visitTypeMasterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VisitTypeMaster",
      // required: [true, "Visit type master is required"],
    },
    visitType: {
      type: String,
      enum: ["visit", "procedure"],
      required: [true, "Visit type is required"],
    },
    noOfVisits: {
      type: Number,
      required: [true, "Number of visits is required"],
      min: 1,
      default: 1,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: 0,
    },
    originalAmount: {
      type: Number,
      required: [true, "Original amount is required"],
      min: 0,
    },
    selectedServices: [
      {
        // For procedure visits only
        serviceId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },
      },
    ],
    remarks: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
VisitMasterSchema.index({ inpatientCaseId: 1, doctorId: 1 });
VisitMasterSchema.index({ visitTypeMasterId: 1 });
VisitMasterSchema.index({ inpatientCaseId: 1, createdAt: -1 });

export default mongoose.model("VisitMaster", VisitMasterSchema);
