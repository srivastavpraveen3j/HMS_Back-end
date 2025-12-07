import mongoose from "mongoose";
import { generateCustomId } from "../utils/generateCustomId.js";

const VitalSchema = new mongoose.Schema(
  {
    bloodGroup: {
      type: String,
    },
    height: {
      type: Number,
    },
    weight: {
      type: Number,
    },
    temperature: {
      type: Number,
    },
    pulseRate: {
      type: Number,
    },
    systolicBloodPressure: {
      type: Number,
    },
    diastolicBloodPressure: {
      type: Number,
    },
    respiratoryRate: {
      type: Number,
    },
    bloodSugar: {
      type: Number,
    },
    spo2: {
      type: Number,
    },
    remarks: {
      type: String,
      trim: true,
    },
    input: {
      type: String,
      trim: true,
      default: "",
    },
    output: {
      type: String,
      trim: true,
      default: "",
    },
    recordedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const InpatientCaseSchema = new mongoose.Schema(
  {
    inpatientCaseNumber: {
      type: String,
      default: () => generateCustomId("I"),
      unique: true,
      validate: {
        validator: (v) => {
          return v != null && v.trim() !== "";
        },
        message: "Inpatient case number cannot be null or empty",
      },
    },
    patient_type: {
      type: String,
      enum: ["med", "cash", "cashless"],
      required: [true, "Patient type is required"],
    },
      // Added company reference for cashless/corporate patients
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyMaster",
      required: function() {
        return this.patient_type === 'cashless' || this.patient_type === 'med'|| this.companyName;
      }
    },
    alternate_mobile: { type: String },
    caseType: {
      type: String,
      enum: ["new", "old"],
      required: [true, "Case type is required"],
    },
    companyName: {
      type: String,
      trim: true,
    },
    uniqueHealthIdentificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UHID",
      required: [true, "UHID is required"],
    },
    thirdPartyAdministratorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ThirdPartyAdministratorClaim",
    },
    admittingDoctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Admitting doctor is required"],
    },
    referringDoctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // isRefSelf: {
    //   type: Boolean,
    //   default: false,
    // },
    wardMasterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WardMaster",
      required: [true, "Ward master is required"],
    },
    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Room ID is required"],
    },
    bed_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bed",
      required: [true, "Bed ID is required"],
    },
     // Add locked rates reference
    lockedRatesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CaseCompanyRates"
    },
    isDischarge: {
      type: Boolean,
      default: false,
    },
    dischargeDateTime: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value >= this.admissionDate;
        },
        message: "Discharge date/time must be after admission date/time",
      },
    },
    dischargeReason: {
      type: String,
      trim: true,
    },
    isMedicoLegalCase: {
      type: Boolean,
      default: false,
    },
    medicoLegalCaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MedicoLegalCase",
    },
    admissionDate: {
      type: Date,
      required: [true, "Admission date is required"],
      validate: {
        validator: (value) => value <= new Date(),
        message: (props) =>
          `Admission date ${props.value} cannot be in the future.`,
      },
    },
    admissionTime: {
      type: Date,
      required: [true, "Admission time is required"],
      validate: {
        validator: (value) => value <= new Date(),
        message: (props) =>
          `Admission time ${props.value} cannot be in the future.`,
      },
    },
    vitals: [VitalSchema],
    isSharing: { type: Boolean, default: false },
    isBedCategorySelected: { type: Boolean, default: false },
    categoryChargeAs: { type: String },
    categoryChargeAsRoomId: { type: mongoose.Schema.Types.ObjectId },
    categoryChargeAsBedId: { type: mongoose.Schema.Types.ObjectId },
    categoryRoomCharge: { type: Number },
    categoryBedCharge: { type: Number },
  },

  {
    timestamps: true, // adds createdAt and updatedAt to InpatientCase
  }
);

const InpatientCase = mongoose.model("InpatientCase", InpatientCaseSchema);
export default InpatientCase;
