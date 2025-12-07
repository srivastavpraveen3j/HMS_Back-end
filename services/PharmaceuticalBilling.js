import PharmaceuticalBilling from '../models/PharmaceuticalBilling.js';

export const createPharmaceuticalBilling = async (data) => {
    const pharmaceuticalBilling = await PharmaceuticalBilling.create(data);
    return pharmaceuticalBilling;
}

export const updatePharmaceuticalBilling = async (id, data) => {
    const pharmaceuticalBilling = await PharmaceuticalBilling.findByIdAndUpdate(id, data, { new: true });
    return pharmaceuticalBilling;
}

export const getPharmaceuticalBilling = async (id) => {
    const pharmaceuticalBilling = await PharmaceuticalBilling.findById(id);
    return pharmaceuticalBilling;
}

export const getAllPharmaceuticalBilling = async () => {
    const pharmaceuticalBilling = await PharmaceuticalBilling.find();
    return pharmaceuticalBilling;
}