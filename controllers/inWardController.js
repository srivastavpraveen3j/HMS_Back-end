import asyncHandler from '../utils/asyncWrapper.js';
import ErrorHandler from '../utils/CustomError.js';
import {
  createInWard,
  getAllInWards,
  getInWardById,
  updateInWard,
  deleteInWard
} from '../services/inWard.js';

export const createInWardController = asyncHandler( async (req, res) => {
  const {requestedDepartment, PaymentMode, amountReceived, total} = req.body;

  if(!requestedDepartment || !PaymentMode  || !total){
    throw new ErrorHandler("All fields are required", 400);
  }

    const inWardData = req.body;
    const data = await createInWard(inWardData);

    if(!data){
      throw new ErrorHandler("Failed to create inWard", 400);
    }

    res.status(201).json(data);
});

export const getAllInWardsController = asyncHandler( async (req, res) => {
    const inWardData = await getAllInWards(req.queryOptions);

    if(!inWardData){
      throw new ErrorHandler("inWard not found", 404);
    }

    res.status(200).json(inWardData);
});

export const getInWardByIdController = asyncHandler( async (req, res) => {
    const { id } = req.params;
    const inWardData = await getInWardById(id);

    if (!inWardData) {
      throw new ErrorHandler("inWard not found", 404);
    }

    res.status(200).json(inWardData);
});

export const updateInWardController = asyncHandler( async (req, res) => {
  if(!req.body || Object.keys(req.body).length === 0){
    throw new ErrorHandler("No data provided for update", 400);
  }

    const { id } = req.params;
    const inWardData = req.body;

    const updatedData = await updateInWard(id, inWardData);

    if (!updatedData) {
      throw new ErrorHandler("inWard not found", 404);
    }

    res.status(200).json(updatedData);
});

export const deleteInWardController = asyncHandler( async (req, res) => {
    const { id } = req.params;

    const deletedData = await deleteInWard(id);

    if (!deletedData) {
      throw new ErrorHandler("inWard not found", 404);
    }

    res.status(200).json({ message: 'Inward data deleted successfully' });
});

