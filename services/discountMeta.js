import DiscountMeta from "../models/DiscountMetaSchema.js";
/**
 * Create a new discount meta entry
 */
export const createDiscountMeta = async (data) => {
  return await DiscountMeta.create(data);
};

/**
 * Get all discount meta entries (optionally paginated or filtered)"requestedBy uhid OutpatientBillID"
 */
export const getAllDiscountMetas = async (filter = {}, options = {}) => {
  return await DiscountMeta.find(filter, null, options).populate([
    { path: "requestedBy" },
    { path: "uhid" },
    { path: "OutpatientBillID"},
  ]);
};

/**
 * Get discount meta by ID
 */
export const getDiscountMetaById = async (id) => {
  return await DiscountMeta.findById(id).populate(
    "requestedBy approvedBy OutpatientBillID"
  );
};

/**
 * Update a discount meta by ID
 */
export const updateDiscountMetaById = async (id, updateData) => {
  return await DiscountMeta.findByIdAndUpdate(id, updateData, { new: true });
};

/**
 * Delete a discount meta by ID
 */
export const deleteDiscountMetaById = async (id) => {
  return await DiscountMeta.findByIdAndDelete(id);
};

export const getDiscountMetaByBillId = async (id) => {
  return await DiscountMeta.find({ OutpatientBillID: id })
};
