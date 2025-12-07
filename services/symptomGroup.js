import symptomGroup from "../models/symptomGroup.js";

export const createSymptomGroup = async (data) => {
  return await symptomGroup.create(data);
};

export const getSymptomGroupById = async (id) => {
  return await symptomGroup.findById(id);
};

export const getSymptomGroup = async (symptomGroups) => {
  return await symptomGroup.findOne({ symptomGroups });
};

export const updateSymptomGroup = async (id, updateData) => {
  return await symptomGroup.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteSymptomGroup = async (id) => {
  return await symptomGroup.findByIdAndDelete(id);
};


export const getAllSymptomGroups = async ({page = 1, limit = 10, symptomGroups}) => {
  const skip = (page - 1) * limit;

  const query = {};
  if (typeof symptomGroups === "string" && symptomGroups.length >= 3) {
    query.symptomGroups = { $regex: symptomGroups, $options: "i" };
  }

  const result = symptomGroup
    .find(query)
    .populate("symptoms")
    .skip(skip)
    .limit(limit);

  const [total, data] = await Promise.all([
    symptomGroup.countDocuments(query),
    result.lean(),
  ]);

  return {
    total,
    page,
    totalPages: Math.ceil(total / limit),
    limit,
    data,
  };
};

