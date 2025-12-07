import TestParameter from "../models/TestParameter.js";

export const createTestParameter = async (data) => {
  return await TestParameter.create(data);
};

export const getTestParameter = async (test_name) => {
  return await TestParameter.findOne({ test_name });
};

export const getAllTestParameters = async () => {
  return await TestParameter.find();
};

export const getTestParameterById = async (id) => {
  return await TestParameter.findById(id);
};

export const updateTestParameter = async (id, data) => {
  return await TestParameter.findByIdAndUpdate(id, data, { new: true });
};

export const deleteTestParameter = async (id) => {
  return await TestParameter.findByIdAndDelete(id);
};

export const getTestsParameter = async ({ limit, page, ...query }) => {
  const result = await TestParameter.find(query)
    .skip((page - 1) * limit)
    .limit(limit);

  return {
    total: await TestParameter.countDocuments(query),
    page,
    totalPages: Math.ceil(await TestParameter.countDocuments(query) / limit),
    limit,
    data: result,
  };
};