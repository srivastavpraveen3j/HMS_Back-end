import asyncHandler from '../utils/asyncWrapper.js';
import ErrorHandler from '../utils/CustomError.js';
import {
  createDischarge,
  getAllDischarges,
  getDischargeById,
  updateDischarge,
} from "../services/dischargeService.js";
import { getInpatientCase } from '../services/inpatientCaseService.js';
import { updateBed } from '../services/bed.js';

export const createDischargeController = async (req, res) => {
    try {
        const discharge = await createDischarge(req.body);
        res.status(201).json(discharge);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllDischargesController = async (req, res) => {
  try {
    const discharges = await getAllDischarges(req.queryOptions);
    res.status(200).json(discharges);
  } catch (error) {
    console.error('Controller Error:', error);
    res.status(500).json({ 
      error: error.message,
      message: "Failed to fetch discharge records" 
    });
  }
};


export const getDischargeByIdController = async (req, res) => {
    try {
        const discharge = await getDischargeById(req.params.id);
        res.status(200).json(discharge);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateDischargeController = async (req, res) => {
    try {
        const discharge = await updateDischarge(req.params.id, req.body);
        res.status(200).json(discharge);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
