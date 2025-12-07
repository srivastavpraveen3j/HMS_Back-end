import serviceSchema from "../models/Service.js";

export const createService = async (data) => {
  return await serviceSchema.create(data);
};

export const getService = async (name) => {
  return await serviceSchema.findOne({ name });
};

export const getServiceById = async (id) => {
  return await serviceSchema.findById(id);
};

export const updateService = async (id, updateData) => {
  return await serviceSchema.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteService = async (id) => {
  return await serviceSchema.findByIdAndDelete(id);
};

export const getAllServices = async (queryOptions) => {
  const { page, limit, query } = queryOptions;
  
  const services = await serviceSchema
    .find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean(); // Use lean() for better performance
    
  const total = await serviceSchema.countDocuments(query);
  
  return { 
    total, 
    page, 
    totalPages: Math.ceil(total / limit), 
    limit, 
    services 
  };
};
