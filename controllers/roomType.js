import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import {
  createRoomType,
  getRoomTypes,
  getRoomType,
  updateRoomType,
  deleteRoomType,
} from "../services/roomType.js";

export const createRoomTypeController = asyncHandler(async (req, res) => {
  const { name, price_per_day } = req.body;

  if (!name || !price_per_day) {
    throw new ErrorHandler("Name and price are required", 400);
  }

  if (price_per_day && typeof price_per_day !== "number") {
    throw new ErrorHandler("Price must be a number", 400);
  }

  const roomType = await createRoomType(req.body);

  if (!roomType) {
    throw new ErrorHandler("Failed to create room type", 400);
  }

  res.status(201).json(roomType);
});

export const getRoomTypesController = asyncHandler(async (req, res) => {
  const roomTypes = await getRoomTypes(req.queryOptions);

  if (!roomTypes) {
    throw new ErrorHandler("Room types not found", 404);
  }

  res.status(200).json(roomTypes);
});

export const getRoomTypeController = asyncHandler(async (req, res) => {
  const roomType = await getRoomType(req.params.id);

  if (!roomType) {
    throw new ErrorHandler("Room type not found", 404);
  }

  res.status(200).json(roomType);
});

export const updateRoomTypeController = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ErrorHandler("No data provided for update", 400);
  }

  const roomType = await updateRoomType(req.params.id, req.body);

  if (!roomType) {
    throw new ErrorHandler("Room type not found", 404);
  }

  res.status(200).json(roomType);
});

export const deleteRoomTypeController = asyncHandler(async (req, res) => {
  const roomType = await deleteRoomType(req.params.id);

  if (!roomType) {
    throw new ErrorHandler("Room type not found", 404);
  }

  res.status(200).json({ message: "Room type deleted successfully" });
});
