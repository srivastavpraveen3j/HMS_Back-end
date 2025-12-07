import ReferralAudit from "../models/referralAuditLog.js";
import ReferralRule from "../models/referralRule.js";

export const createReferralRule = async (data) => {
  const rule = new ReferralRule(data);
  await rule.save();
  return rule;
};

export const getAllReferralRule = async ({ limit, page, params }) => {
  const { query } = params;
  const searchQuery = { ...query };

  if (query.department && query.department.length >= 3) {
    searchQuery.department = { $regex: query.department, $options: "i" };
  }

  const rules = await ReferralRule.find(searchQuery)
    .populate("serviceName")
    .skip((page - 1) * limit)
    .limit(limit);
  const total = await ReferralRule.countDocuments(searchQuery);
  return { total, page, totalPages: Math.ceil(total / limit), limit, rules };
};

export const getReferralRule = async (id) => {
  return await ReferralRule.findById(id);
};

export const updateReferralRule = async (id, data) => {
  const existingRule = await ReferralRule.findById(id);
  if (!existingRule) {
    return null; // return null and handle in controller
  }

  const oldPercent = existingRule.referralPercent;
  const newPercent = data.referralPercent;

  const updated = await ReferralRule.findByIdAndUpdate(id, data, {
    new: true,
  });

  // Save audit log
  await ReferralAudit.create({
    changedBy: data.changedBy || "System", // Make sure to pass this from frontend
    affectedRule: updated.serviceName,
    action: "Updated",
    oldValue: `${oldPercent}%`,
    newValue: `${newPercent}%`,
  });

  return updated;
};

export const deleteReferralRule = async (id) => {
  return await ReferralRule.findByIdAndDelete(id);
};
