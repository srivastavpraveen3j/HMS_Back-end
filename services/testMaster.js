import TestMaster from '../models/TestMaster.js';

export const createTestMaster = async (data) => {
  return await TestMaster.create(data);
};

export const getAllTestMasters = async () => {
  return await TestMaster.find();
};

export const getTestMasterById = async (id) => {
  return await TestMaster.findById(id);
};

export const updateTestMaster = async (id, data) => {
  return await TestMaster.findByIdAndUpdate(id, data, { new: true });
};

export const deleteTestMaster = async (id) => {
  return await TestMaster.findByIdAndDelete(id);
};
