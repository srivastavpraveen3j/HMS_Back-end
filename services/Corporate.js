import Corporate from "../models/Corporate";


export const getAllCorporates = async () => {
    return await Corporate.findAll(filter);
}


export const getCorporateById = async (id) => {
    return await Corporate.findById(id);
}


export const createCorporate = async (data) => {
    return await Corporate.create(data)
}

export const updateCorporte = async (id, data) => {
    return await Corporate.updateOne(id, data);
}

export const deleteCorporte = async (id) => {
    return await Corporate.findOneAndDelete(id);
}