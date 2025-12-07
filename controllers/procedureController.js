import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler  from "../utils/CustomError.js";
import { createProcedure, getProcedure, updateProcedure, deleteProcedure, getProcedureById } from "../services/procedureService.js";
import mongoose from "mongoose";

export const createProcedureController = asyncHandler(async(req , res)=>{

    const procedure = await createProcedure(req.body);
    
    if(!procedure){
        throw new ErrorHandler("Failed to create Procedure",400)
    }

    res.status(201).json(procedure);
});

export const getProcedureController = asyncHandler(async (req,res)=> {
    const procedure = await getProcedure(req.queryOptions);

    if(!procedure){
        throw new ErrorHandler("Procedure not Found", 404);
    }

    res.status(200).json(procedure);
});

export const getProcedureByIdController = asyncHandler(async (req, res) =>{
    const procedure = await getProcedureById(req.params.id);

    if(!procedure){
        throw new ErrorHandler("Procedure not Found", 404)
    }

    res.status(200).json(procedure)
});

export const updateProcedureController = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ErrorHandler("Data cannot be empty", 400);
  }
  const vitals = await updateProcedure(req.params.id, req.body);

  if (!vitals) {
    throw new ErrorHandler("Procedure not found", 404);
  }

  res.status(200).json(vitals);
});

export const deleteProcedureController = asyncHandler(async (req, res) => {
  const vitals = await deleteProcedure(req.params.id);

  if (!vitals) {
    throw new ErrorHandler("Procedure not found", 404);
  }

  res.status(200).json({
    message: "Procedure deleted successfully",
  });
});
