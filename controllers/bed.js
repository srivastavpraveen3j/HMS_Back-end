import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import { createBed, getBeds, getBed, updateBed, deleteBed, getbyNumber } from "../services/bed.js";

export const createBedController = asyncHandler(async (req, res) => {
    const { bed_number, bed_type_id } = req.body;

    if (!bed_number || !bed_type_id) {
        throw new ErrorHandler("Bed number and bed type are required", 400);
    }

    // get bed by number
    const isbed = await getbyNumber(bed_number);

    if (isbed) {
        throw new ErrorHandler("Bed number already exist", 409);
    }

    const bed = await createBed(req.body);

    if (!bed) {
        throw new ErrorHandler("Failed to create bed", 500);
    }

    res.status(201).json({
        success: true,
        data: bed
    });
});

export const getBedsController = asyncHandler(async (req, res) => {
    const beds = await getBeds(req.queryOptions);

    if (!beds || beds.length === 0) {
        throw new ErrorHandler("No beds found", 404);
    }
    res.status(200).json(beds);
});

export const getBedController = asyncHandler(async (req, res) => {
    const bed = await getBed(req.params.id);

    if (!bed) {
        throw new ErrorHandler("Bed not found", 404);
    }

    res.status(200).json({
        success: true,
        data: bed
    });
});

export const updateBedController = asyncHandler(async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        throw new ErrorHandler("No data provided", 400);
    }

    const bed = await updateBed(req.params.id, req.body);

    if (!bed) {
        throw new ErrorHandler("Failed to update bed or not found", 404);
    }

    res.status(200).json({
        success: true,
        data: bed
    });
});

export const deleteBedController = asyncHandler(async (req, res) => {
    const bed = await deleteBed(req.params.id);

    if (!bed) {
        throw new ErrorHandler("Failed to delete bed or not found", 404);
    }

    res.status(200).json({
        success: true,
        message: "Bed type deleted successfully"
    });
});

