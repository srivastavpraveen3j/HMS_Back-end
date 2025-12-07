import mongoose from "mongoose";

const doctorMasterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    contactDetails: {
      phone: {
        type: String,
        required: true,
        match: /^[0-9]{10}$/, // basic validation for 10-digit number
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
      address: {
        type: String,
        trim: true,
      },
    },
    specialization: {
      type: String,
      trim: true,
    },
    experience: {
      type: Number, // in years
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// ✅ Export both schema and model
const DoctorMaster = mongoose.model("DoctorMaster", doctorMasterSchema);

export { doctorMasterSchema, DoctorMaster };