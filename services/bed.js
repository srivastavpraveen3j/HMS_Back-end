import Bed from "../models/Bed.js";

export const createBed = async (data) => {
    const bed = await Bed.create(data);
    return bed;
};

export const getBeds = async ({ limit, page, params }) => {
    const { query } = params;
    const beds = await Bed.find(query).populate("bed_type_id").skip((page - 1) * limit).limit(limit);
    const total = await Bed.countDocuments(query);
    return {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
        beds,
    };
};

export const getBed = async (id) => {
    const bed = await Bed.findById(id);
    return bed;
}

export const updateBed = async (id, data) => {
    const bed = await Bed.findByIdAndUpdate(id, data, { new: true });
    return bed;
}

export const deleteBed = async (id) => {
    const bed = await Bed.findByIdAndDelete(id);
    return bed;
}


export const getbyNumber  = async (bed_number) => {
    const bed = await Bed.findOne({ bed_number });
    return bed;
}