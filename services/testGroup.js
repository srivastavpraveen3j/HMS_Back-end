import TestGroup from "../models/TestGroup.js";

export const createTestGroup = async (data) => {
  return await TestGroup.create(data);
};

export const getTestGroup = async (testGroup) => {
  return await TestGroup.findOne({testGroup});
}

export const getAllTestGroups = async () => {
  return await TestGroup.find().populate('testParameters');
};

export const getTestGroupById = async (id) => {
  return await TestGroup.findById(id);
};

export const updateTestGroup = async (id, data) => {
  return await TestGroup.findByIdAndUpdate(id, data, { new: true });
};

export const deleteTestGroup = async (id) => {
  return await TestGroup.findByIdAndDelete(id);
};

export const getTestGroupFilter = async ({ limit, page, ...query }) => {
  const searchQuery = { ...query };

  if (typeof query.testGroup === "string" && query.testGroup.length >= 3) {
    searchQuery.testGroup = { $regex: query.testGroup, $options: "i" };
  }

  const testGroup = await TestGroup.find(searchQuery)
    .skip((page - 1) * limit)
    .limit(limit);

  return testGroup;
};

