import ServiceGroup from "../models/ServiceGroup.js";

export const createServiceGroup = async (data) => {
    return await ServiceGroup.create(data);
};

export const getServiceGroup = async (name) => {
    return await ServiceGroup.findOne({ name });
};

export const getServiceGroupById = async (id) => {
    return await ServiceGroup.findById(id);
};

export const updateServiceGroup = async (id, updateData) => {
    return await ServiceGroup.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteServiceGroup = async (id) => {
    return await ServiceGroup.findByIdAndDelete(id);
};

export const getAllServiceGroups = async ({ limit, page, params }) => {
  const query = {};

  // filter by group_name
  if (params.group_name) {
    query.group_name = { $regex: params.group_name, $options: "i" };
  }

  // filter by type
  if (params.type) {
    query.type = params.type;
  }

  let groupsQuery = ServiceGroup.find(query);

  // 🔎 if serviceName filter is provided
  if (params.serviceName) {
    // Match service by name (populate + filter)
    groupsQuery = groupsQuery.populate({
      path: "services",
      match: { name: { $regex: params.serviceName, $options: "i" } },
    });
  } else {
    groupsQuery = groupsQuery.populate("services");
  }

  const groups = await groupsQuery
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await ServiceGroup.countDocuments(query);

  return {
    total,
    page,
    totalPages: Math.ceil(total / limit),
    limit,
    groups,
  };
};

