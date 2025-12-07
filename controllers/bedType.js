import asyncHandler from "../utils/asyncWrapper.js"
import ErrorHandler from "../utils/CustomError.js";
import {
    createBedType,
    getBedTypes,
    getBedType,
    updateBedType,
    deleteBedType
} from "../services/bedType.js";

// Create Bed Type
export const createBedTypeController = asyncHandler(async (req, res) => {
    const { name, price_per_day } = req.body;

    if (!name || !price_per_day) {
        throw new ErrorHandler("Bed type name and price per day are required", 400);
    }

    // Check if bed type already exists
    const existingBedType = await getBedType(name);

    if(existingBedType) {
        throw new ErrorHandler("Bed type already exists", 409);
    }

    const bedType = await createBedType(req.body);

    if (!bedType) {
        throw new ErrorHandler("Bed type creation failed", 500);
    }

    res.status(201).json({
        success: true,
        data: bedType
    });
});

// Get All Bed Types
export const getBedTypesController = asyncHandler(async (req, res) => {
    const bedTypes = await getBedTypes(req.queryOptions);

    if (!bedTypes || bedTypes.length === 0) {
        throw new ErrorHandler("No bed types found", 404);
    }

    res.status(200).json({
        success: true,
        data: bedTypes
    });
});

// Get Single Bed Type
export const getBedTypeController = asyncHandler(async (req, res) => {
    const bedType = await getBedType(req.params.id);

    if (!bedType) {
        throw new ErrorHandler("Bed type not found", 404);
    }

    res.status(200).json({
        success: true,
        data: bedType
    });
});

// Update Bed Type
export const updateBedTypeController = asyncHandler(async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        throw new ErrorHandler("Update data cannot be empty", 400);
    }

    const bedType = await updateBedType(req.params.id, req.body);

    if (!bedType) {
        throw new ErrorHandler("Bed type update failed or not found", 404);
    }

    res.status(200).json({
        success: true,
        data: bedType
    });
});

// Delete Bed Type
export const deleteBedTypeController = asyncHandler(async (req, res) => {
    const bedType = await deleteBedType(req.params.id);

    if (!bedType) {
        throw new ErrorHandler("Bed type delete failed or not found", 404);
    }

    res.status(200).json({
        success: true,
        message: "Bed type deleted successfully"
    });
});