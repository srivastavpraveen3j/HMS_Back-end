import mongoose from "mongoose";

const DiagnosisSheetSchema = new mongoose.Schema(
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
    outpatientCaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OutpatientCase",
      // required: [true, 'Inpatient Case ID is required'],
    },

    vitals: {
      bloodGroup: {
        type: String,
        // required: [true, 'Blood group is required'],
      },
      height: {
        type: Number,
        // required: [true, 'Height is required'],
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
      remarks: {
        type: String,
        trim: true,
        // maxlength: [500, 'Remarks should not exceed 500 characters'],
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
    },

    symptoms: [
      {
        name: { type: String, trim: true },
        properties: { type: String, trim: true },
        since: { type: String, trim: true },
        remarks: { type: String, trim: true },
      },
    ],

    clinicalExamination: { type: String, trim: true },
    diagnosis: { type: String, trim: true },
    medicalHistory: { type: String, trim: true },
    investigation: { type: String, trim: true },

    packages: [
      {
        medicineName: {
          type: String,
          trim: true,
        },
        quantity: {
          type: Number,
        },
        checkbox: {
          morning: { type: Boolean, default: false },
          noon: { type: Boolean, default: false },
          evening: { type: Boolean, default: false },
          night: { type: Boolean, default: false },
        },
        dosageInstruction: {
          type: String,
          // required: [true, 'Dosage instruction is required'],
        },
      },
    ],

    nextFollowUpDate: { type: Date },
    primaryDiagnosis: { type: String, trim: true },
    extraDetails: { type: String, trim: true },
    generalAdvice: { type: String, trim: true },
    allergy: { type: String, trim: true },
    testprescription: { type: String, trim: true },

    type: {
      type: String,
      enum: ["inpatientDepartment", "outpatientDepartment"],
      required: [
        true,
        "Type (inpatientDepartment or outpatientDepartment) is required",
      ],
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

// ✅ Add pre-save middleware to remove empty packages array
DiagnosisSheetSchema.pre("save", function (next) {
  if (this.packages && this.packages.length === 0) {
    this.packages = undefined;
  }
  next();
});

const DiagnosisSheet = mongoose.model("DiagnosisSheet", DiagnosisSheetSchema);
export default DiagnosisSheet;
