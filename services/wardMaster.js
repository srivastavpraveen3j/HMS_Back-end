import wardMaster from "../models/wardMaster.js";

export const createWardMaster = async (data) => {
  return await wardMaster.create(data);
};

export const getWardMaster = async (ward_name) => {
  return await wardMaster.findOne({ ward_name });
};

export const getWardMasterById = async (id) => {
  return await wardMaster.findById(id);
};

export const updateWardMaster = async (id, updateData) => {
  return await wardMaster.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteWardMaster = async (id) => {
  return await wardMaster.findByIdAndDelete(id);
};

export const getAllWardMasters = async ({ page, limit, params }) => {
  const { query } = params;
  const wardMasters = await wardMaster
    .find(query)
    .populate({
      path: "room_id",
      populate: { path: "bed_id", populate: { path: "bed_type_id" } },
    })
    .populate({
      path: "room_id",
      populate: { path: "room_type_id" },
    })
    .skip((page - 1) * limit)
    .limit(limit);
  const total = await wardMaster.countDocuments(query);
  return {
    total,
    page,
    totalPages: Math.ceil(total / limit),
    limit,
    wardMasters,
  };
};
