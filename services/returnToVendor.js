import ReturnToVendor from '../models/returnToVendor.model.js';

export const createReturnToVendor = data => {
  return ReturnToVendor.create(data);
};

export const getAllReturnToVendors = () => {
  return ReturnToVendor.find().populate('goodsReceiptNoteItem createdByUser');
};

export const getReturnToVendorById = id => {
  return ReturnToVendor.findById(id).populate('goodsReceiptNoteItem createdByUser');
};

export const updateReturnToVendor = (id, data) => {
  return ReturnToVendor.findByIdAndUpdate(id, data, { new: true });
};

export const deleteReturnToVendor = id => {
  return ReturnToVendor.findByIdAndDelete(id);
};
