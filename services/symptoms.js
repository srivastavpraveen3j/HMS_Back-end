import symptoms from "../models/symptoms.js";

export const createSymptom = async (data) => {
    return await symptoms.create(data);
};

export const getExistSymptom = async (name) => {
    return await symptoms.findOne({ name });
}

export const getSymptomById = async (id) => {
    return await symptoms.findById(id);
};

export const updateSymptom = async (id, updateData) => {
    return await symptoms.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteSymptom = async (id) => {
    return await symptoms.findByIdAndDelete(id);
};

// export const getAllSymptoms = async ({limit,page,params}) => {
//     const {query} = params;
//      const data = await symptoms.find(query).skip((page - 1) * limit).limit(limit);
//      const total = await symptoms.countDocuments(query);
//      return {total, page, totalPages: Math.ceil(total / limit), limit, data};
// };

export const getAllSymptoms = async ({ limit, page, params }) => {
  const { query } = params;

  const searchQuery = { ...query };

  if (query.name && query.name.length >= 3) {
    searchQuery.name = { $regex: query.name, $options: "i" }; 
  }

  const data = await symptoms
    .find(searchQuery)
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await symptoms.countDocuments(searchQuery);

  return {
    total,
    page,
    totalPages: Math.ceil(total / limit),
    limit,
    data,
  };
};


