import PurchaseInvoice from '../models/purchaseInvoice.model.js';

export const createPurchaseInvoice = data => {
  return PurchaseInvoice.create(data);
};

export const getAllPurchaseInvoices = () => {
  return PurchaseInvoice.find().populate('goodsReceiptNote');
};

export const getPurchaseInvoiceById = id => {
  return PurchaseInvoice.findById(id).populate('goodsReceiptNote');
};

export const updatePurchaseInvoice = (id, data) => {
  return PurchaseInvoice.findByIdAndUpdate(id, data, { new: true });
};

export const deletePurchaseInvoice = id => {
  return PurchaseInvoice.findByIdAndDelete(id);
};
