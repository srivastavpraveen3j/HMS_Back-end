import {
    createWardMaster,
    getAllWardMasters,
    getWardMaster,
    getWardMasterById,
    updateWardMaster,
    deleteWardMaster
} from "../services/wardMaster.js";

import ErrorHandler from "../utils/CustomError.js";
import asyncHandler from "../utils/asyncWrapper.js";


// Create a new ward master
export const createNewWardMaster = asyncHandler(async (req, res, next) => {
    const { ward_name, room_id, remarks } = req.body;

    if (!ward_name || !room_id) {
        return next(new ErrorHandler("Ward name and room ID are required", 400));
    }

    if (!Array.isArray(room_id)) {
        return next(new ErrorHandler("Room ID must be an array", 400));
    }

    if (remarks && typeof remarks !== 'string') {
        return next(new ErrorHandler("Remarks must be a string", 400));
    }

    const existWard = await getWardMaster(ward_name);
    if(existWard) {
        return next(new ErrorHandler("Ward already exists", 409));
    }
    
    const payload = {
        ward_name,
        room_id,
        remarks
    }
    const wardMaster = await createWardMaster(payload);
    res.status(201).json(wardMaster);
});

// Get all ward masters
export const getWardMasters = asyncHandler(async (req, res, next) => {
    const wardMasters = await getAllWardMasters(req.queryOptions);
    res.json(wardMasters);
});

// Get ward master by ID
export const getWardMasterByIdHandler = asyncHandler(async (req, res, next) => {

    if (!req.params.id) {
        return next(new ErrorHandler("Ward master ID is required", 400));
    }

    const wardMaster = await getWardMasterById(req.params.id);
    if (!wardMaster) {
        return next(new ErrorHandler("Ward master not found", 404));
    }
    res.json(wardMaster);
});

// Update ward master by ID
export const updateWardMasterByIdHandler = asyncHandler(async (req, res, next) => {
    const updatedWardMaster = await updateWardMaster(req.params.id, req.body);
    if (!updatedWardMaster) {
        return next(new ErrorHandler("Ward master not found", 404));
    }
    res.json(updatedWardMaster);
});

// Delete ward master by ID
export const deleteWardMasterByIdHandler = asyncHandler(async (req, res, next) => {
    
    if (!req.params.id) {
        return next(new ErrorHandler("Ward master ID is required", 400));
    }
    
    const deletedWardMaster = await deleteWardMaster(req.params.id);
    if (!deletedWardMaster) {
        return next(new ErrorHandler("Ward master not found", 404));
    }
    res.json({ message: "Ward master deleted successfully" });
});

