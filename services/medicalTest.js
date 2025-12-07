import medicalTest from "../models/medicalTest.js";

export const createMedicalTest = async (data) => {
    return await medicalTest.create(data);
};

export const getMedicalTest = async (test_name) => {
    return await medicalTest.findOne({ test_name });
};

export const getMedicalTestById = async (id) => {
    return await medicalTest.findById(id);
};

export const updateMedicalTest = async (id, updateData) => {
    return await medicalTest.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteMedicalTest = async (id) => {
    return await medicalTest.findByIdAndDelete(id);
};

export const getAllMedicalTests = async ({ limit, page, params }) => {
    const { query } = params;
    const medicalTests = await medicalTest.find(query).skip((page - 1) * limit).limit(limit);
    const total = await medicalTest.countDocuments(query);
    return {total, page, totalPages: Math.ceil(total / limit), limit, medicalTests};
};