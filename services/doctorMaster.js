// import { DoctorMaster } from "../models/doctoreMaster.js";
import Doctor from "../models/doctor.js";
/**
 * Create a new doctor
 */
export const createDoctor = async (doctorData) => {
  try {
    const doctor = await Doctor.create(doctorData);
    return doctor;
  } catch (error) {
    throw new Error(`Failed to create doctor: ${error.message}`);
  }
};
/**
 * Get all doctors (with optional filters)
 */
export const getAllDoctors = async (filter = "") => {
  try {
    const query = filter
      ? {
        $or: [
          { name: { $regex: filter, $options: "i" } },
          { mobile: { $regex: filter, $options: "i" } },
          { specialization: { $regex: filter, $options: "i" } }
        ]
      }
      : {};

    return await Doctor.find(query).sort({ name: 1 });

  } catch (error) {
    throw new Error(`Failed to fetch doctors: ${error.message}`);
  }
};


/**
 * Get doctor by ID
 */
export const getDoctorById = async (id) => {
  try {
    const doctor = await Doctor.findById(id);
    if (!doctor) throw new Error("Doctor not found");
    return doctor;
  } catch (error) {
    throw new Error(`Failed to fetch doctor: ${error.message}`);
  }
};

/**
 * Update doctor details
 */
export const updateDoctor = async (id, updateData) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!doctor) throw new Error("Doctor not found or update failed");
    return doctor;
  } catch (error) {
    throw new Error(`Failed to update doctor: ${error.message}`);
  }
};

/**
 * Delete a doctor (hard delete)
 */
export const deleteDoctor = async (id) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(id);
    if (!doctor) throw new Error("Doctor not found or delete failed");
    return doctor;
  } catch (error) {
    throw new Error(`Failed to delete doctor: ${error.message}`);
  }
};

/**
 * Toggle doctor active/inactive status
 */
export const toggleDoctorStatus = async (id, isActive) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );
    if (!doctor) throw new Error("Doctor not found or status update failed");
    return doctor;
  } catch (error) {
    throw new Error(`Failed to update status: ${error.message}`);
  }
};
