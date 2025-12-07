import ReferralAudit from "../models/referralAuditLog.js";

export const getAudits = async ({ page, limit, params}) => {
    const { query } = params;
    const searchQuery = { ...query };

    // if (query.department && query.department.length >= 3) {
    //   searchQuery.department = { $regex: query.department, $options: "i" };
    // }

    const audits = await ReferralAudit.find(searchQuery)
      .populate("affectedRule")
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await ReferralAudit.countDocuments(searchQuery);
    return { total, page, totalPages: Math.ceil(total / limit), limit, audits };
}

export const getAudit = async (id) => {
    return await ReferralAudit.findById(id);
}

export const updateAudit = async (id, data) => {
    return await ReferralAudit.findByIdAndUpdate(id, data, { new: true });
}

export const deleteAudit = async (id) => {
    return await ReferralAudit.findByIdAndDelete(id);
}