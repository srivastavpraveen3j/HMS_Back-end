import {
  createReturnToVendor,
  getAllReturnToVendors,
  getReturnToVendorById,
  updateReturnToVendor,
  deleteReturnToVendor
} from '../services/returnToVendor.service.js';

export const create = async (req, res) => {
  const rtv = await createReturnToVendor(req.body);
  res.status(201).json(rtv);
};

export const getAll = async (req, res) => {
  const rtvs = await getAllReturnToVendors();
  res.json(rtvs);
};

export const getById = async (req, res) => {
  const rtv = await getReturnToVendorById(req.params.id);
  res.json(rtv);
};

export const update = async (req, res) => {
  const updated = await updateReturnToVendor(req.params.id, req.body);
  res.json(updated);
};

export const remove = async (req, res) => {
  await deleteReturnToVendor(req.params.id);
  res.json({ success: true });
};
