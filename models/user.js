import mongoose from "mongoose";
import typesense from "../utils/typesenseClient.js"; // adjust path if needed

const baseOptions = {
  discriminatorKey: "userType", // userType defines the role-specific schema
  collection: "user_profiles",
  timestamps: true,
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    age: {
      type: Number,
      min: 18,
      max: 100,
    },

    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: [true, "Role is required"],
    },

    degree: {
    type: String,
    // required: [true, 'Degree is required'],
    trim: true,
  },
   reg_no: {
    type: String,
    // required: [true, 'Registration number is required'],
    trim: true,
  },
  speciality: {
    type: String,
    // required: [true, 'Speciality is required'],
    trim: true,
  },
  specialization: {
    type: String,
    // required: [true, 'Specialization is required'],
    trim: true,
  },
  qualifications: {
    type: String,
    // required: [true, 'Qualifications is required'],
    trim: true,
  },
  experience: {
    type: String,
    // required: [true, 'Experience is required'],
    trim: true,
  },

    details: {
      department: { type: String },
      experience: { type: String },
      shift: { type: String, enum: ["Day", "Night", "Rotational"] },
      employeeCode: { type: String },
      certification: { type: String },
      licenseNo: { type: String },
      registrationNo: { type: String },
      specialization: { type: String },
      technicianId: { type: String },
      equipmentHandled: { type: [String] },
      labSections: { type: [String] },
      supportLevel: { type: String, enum: ["Level 1", "Level 2", "Level 3"] },
      assignedSystems: { type: [String] },
      cashHandling: { type: Boolean },
      billingSoftware: { type: String },
      assignedWards: { type: [String] },
      emergencyContactName: { type: String },
      emergencyContactPhone: { type: String },
      addressLine1: { type: String },
      addressLine2: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      dateOfJoining: { type: Date },
      status: {
        type: String,
        enum: ["active", "on_leave", "retired"],
        default: "active",
      },
    },
  },
  { timestamps: true }
);

// ✅ Sync to Typesense after save
userSchema.post("save", async function (doc) {
  try {
    await typesense.collections("users").documents().upsert({
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      phone: doc.details?.emergencyContactPhone || "", // fallback
      role: doc.role?.toString(),
      department: doc.details?.department || "",
      status: doc.details?.status || "active",
      employeeCode: doc.details?.employeeCode || "",
      specialization: doc.details?.specialization || "",
      shift: doc.details?.shift || "",
    });
    console.log("[Typesense] Synced user:", doc.name);
  } catch (err) {
    console.error("[Typesense] User sync failed:", err.message);
  }
});

// ✅ Remove from Typesense on delete
userSchema.post("findOneAndDelete", async function (doc) {
  if (!doc) return;
  try {
    await typesense.collections("users").documents(doc._id.toString()).delete();
    console.log("[Typesense] Deleted user:", doc.name);
  } catch (err) {
    console.error("[Typesense] User delete failed:", err.message);
  }
});

const User = mongoose.model("User", userSchema);
export default User;
