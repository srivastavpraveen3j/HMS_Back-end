import BedType from "../models/BedTypeSchema.js";

export const createBedType = async (data) => {
  const bedType = await BedType.create(data);
  return bedType;
};

export const getBedTypes = async ({ limit, page, params }) => {
  const { query } = params;
  const searchQuery = { ...query };

  if (query.name && query.name.length >= 3) {
    searchQuery.name = { $regex: query.name, $options: "i" };
  }
  const bedTypes = await BedType.find(searchQuery)
    .skip((page - 1) * limit)
    .limit(limit);
  const total = await BedType.countDocuments(query);
  return {
    total,
    page,
    totalPages: Math.ceil(total / limit),
    limit,
    bedTypes,
  };
};

export const getBedType = async (id) => {
  if (!id) return null;

  // const bedType = await BedType.findOne({
  //   name: { $regex: `^${name.trim()}$`, $options: "i" },
  // });

  const bedType = await BedType.findById(id);

  return bedType;
};

export const updateBedType = async (id, data) => {
  const bedType = await BedType.findByIdAndUpdate(id, data, { new: true });
  return bedType;
};

export const deleteBedType = async (id) => {
  const bedType = await BedType.findByIdAndDelete(id);
  return bedType;
};
