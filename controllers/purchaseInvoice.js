import {
  createPurchaseInvoice,
  getAllPurchaseInvoices,
  getPurchaseInvoiceById,
  updatePurchaseInvoice,
  deletePurchaseInvoice
} from '../services/purchaseInvoice.service.js';

export const create = async (req, res) => {
  const invoice = await createPurchaseInvoice(req.body);
  res.status(201).json(invoice);
};

export const getAll = async (req, res) => {
  const invoices = await getAllPurchaseInvoices();
  res.json(invoices);
};

export const getById = async (req, res) => {
  const invoice = await getPurchaseInvoiceById(req.params.id);
  res.json(invoice);
};

export const update = async (req, res) => {
  const updated = await updatePurchaseInvoice(req.params.id, req.body);
  res.json(updated);
};

export const remove = async (req, res) => {
  await deletePurchaseInvoice(req.params.id);
  res.json({ success: true });
};
