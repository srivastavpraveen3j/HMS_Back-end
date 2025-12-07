import doctor from "../models/doctor.js";

export const createDoctor = async (data) => {
  console.log(data)
  return await doctor.create(data);
};

export const getAllDoctors = async (data) => {
  return await doctor.find();
};

export const getDoctorById = async (id) => {
  return await doctor.findById(id);
};

export const updateDoctor = async (id, updateData) => {
  return await doctor.findByIdAndUpdate(id, updateData, { new: true });
};

export const deactivateDoctor = async (id) => {
  return await doctor.findByIdAndUpdate(id, { status: 'INACTIVE' }, { new: true });
};

export const activateDoctor = async (id) => {
  return await doctor.findByIdAndUpdate(id, { status: 'ACTIVE' }, { new: true });
};

export const deleteDoctor = async (id) => {
  return await doctor.findByIdAndDelete(id);
};

export const searchDoctors = async (query) => {
  const regex = new RegExp(query, 'i');
  return await doctor.find({
    $or: [{ name: regex }, { mobile_no: regex }],
  });
};



