import RoomType from "../models/RoomType.js";

export const createRoomType = async (data) => {
  const roomType = await RoomType.create(data);
  return roomType;
};

export const getRoomTypes = async ({ limit, page, params }) => {
  const { query } = params;
  const searchQuery = { ...query };

  if (query.name && query.name.length >= 3) {
    searchQuery.name = { $regex: query.name, $options: "i" };
  }
  const roomTypes = await RoomType.find(searchQuery)
    .skip((page - 1) * limit)
    .limit(limit);
  const total = await RoomType.countDocuments(query);
  return {
    total,
    page,
    totalPages: Math.ceil(total / limit),
    limit,
    roomTypes,
  };
};

export const getRoomType = async (id) => {
  const roomType = await RoomType.findById(id);
  return roomType;
};

export const updateRoomType = async (id, data) => {
  const roomType = await RoomType.findByIdAndUpdate(id, data, { new: true });
  return roomType;
};

export const deleteRoomType = async (id) => {
  const roomType = await RoomType.findByIdAndDelete(id);
  return roomType;
};

export const getRoomTypeByName = async (name) => {
  if (!name) return null;

  const roomType = await RoomType.findOne({
    name: { $regex: name.trim(), $options: "i" },
  });

  return roomType;
};
