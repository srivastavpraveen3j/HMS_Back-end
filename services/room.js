import Room from "../models/Room.js";

export const createRoom = async (data) => {
    const room = await Room.create(data);
    return room;
};

export const getExistRoom = async (roomNumber) => {
    const room = await Room.findOne({roomNumber});
}

export const getRooms = async ({ limit, page, params }) => {
    const { query } = params;
    const rooms = await Room.find(query).populate([
        { path: "bed_id", populate: { path: "bed_type_id" } },
        { path: "room_type_id" }]).skip((page - 1) * limit).limit(limit);

    const total = await Room.countDocuments(query);

    return {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
        rooms,
    };
};

export const getRoom = async (id) => {
    const room = await Room.findById(id);
    return room;
}

export const updateRoom = async (id, data) => {
    const room = await Room.findByIdAndUpdate(id, data, { new: true });
    return room;
}

export const deleteRoom = async (id) => {
    const room = await Room.findByIdAndDelete(id);
    return room;
}

