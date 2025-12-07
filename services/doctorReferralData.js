import doctorReferralData from "../models/doctorReferralData.js";

export const createReferralData = async (data) => {
  const rule = new doctorReferralData(data);
  await rule.save();
};

export const getAllReferralData = async ({ limit, page, params }) => {
  const { query } = params;
  const searchQuery = { ...query };

  if (query.department && query.department.length >= 3) {
    searchQuery.department = { $regex: query.department, $options: "i" };
  }

  const rules = await doctorReferralData
    .find(searchQuery)
    .populate([
      {
        path: "OutpatientBillID",
        populate: {
          path: "DiscountMeta",
          model: "DiscountMeta", // 👈 optional if mongoose can infer
        },
      },
      { path: "referredBy" },
      { path: "referredTo" },
      { path: "patient" },
      { path: "service" }
    ])

    .skip((page - 1) * limit)
    .limit(limit);
  const total = await doctorReferralData.countDocuments(searchQuery);
  return { total, page, totalPages: Math.ceil(total / limit), limit, rules };
};

export const getReferralData = async (id) => {
  return await doctorReferralData.findById(id);
};

export const updateReferralData = async (id, data) => {
  return await doctorReferralData.findByIdAndUpdate(id, data, { new: true });
};

export const deleteReferralData = async (id) => {
  return await doctorReferralData.findByIdAndDelete(id);
};
