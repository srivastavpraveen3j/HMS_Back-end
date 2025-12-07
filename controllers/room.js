import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import {
  createRoom,
  getRooms,
  getExistRoom,
  getRoom,
  updateRoom,
  deleteRoom,
} from "../services/room.js";

export const createRoomController = asyncHandler(async (req, res) => {
  const { roomNumber, bed_id, remarks } = req.body;
  if (!roomNumber || typeof roomNumber !== "string") {
    throw new ErrorHandler("Room number is required and must be a string", 400);
  }

  if (!Array.isArray(bed_id) || bed_id.length === 0) {
    throw new ErrorHandler("bed_id must be a non-empty array", 400);
  }

  if (remarks && typeof remarks !== "string") {
    throw new ErrorHandler("remarks must be a string", 400);
  }

  const existRoom = await getExistRoom(roomNumber);
  if(existRoom) {
    throw new ErrorHandler("Room number already exists", 409);
  }
  
  const room = await createRoom(req.body);
  if (!room) {
    throw new ErrorHandler("Failed to create room", 400);
  }

  res.status(201).json(room);
});

export const getRoomsController = asyncHandler(async (req, res) => {
  const rooms = await getRooms(req.queryOptions);

  if (!rooms) {
    throw new ErrorHandler("Rooms not found", 404);
  }

  res.status(200).json(rooms);
});

export const getRoomController = asyncHandler(async (req, res) => {
  const room = await getRoom(req.params.id);

  if (!room) {
    throw new ErrorHandler("Room not found", 404);
  }

  res.status(200).json(room);
});

export const updateRoomController = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ErrorHandler("Request Body cannot be empty", 400);
  }

  const room = await updateRoom(req.params.id, req.body);
  
  if (!room) {
    throw new ErrorHandler("Failed to update room", 400);
  }

  res.status(200).json(room);
});

export const deleteRoomController = asyncHandler(async (req, res) => {
  const room = await deleteRoom(req.params.id);

  if (!room) {
    throw new ErrorHandler("Room not found", 404);
  }

  res.status(200).json({ message: "Room deleted successfully" });
});
