import InWard from '../models/InWard.js';

export const createInWard = async (data) => {
   return await InWard.create(data);
};

export const getAllInWards = async () => {
  return await InWard.find();
};

export const getInWardById = async (id) => {
  return await InWard.findById(id);
   
};

export const updateInWard = async (id, data) => {
  return await InWard.findByIdAndUpdate(id, data, { new: true });
};

export const deleteInWard = async (id) => {
  return await InWard.findByIdAndDelete(id);
};
