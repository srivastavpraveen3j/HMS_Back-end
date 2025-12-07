import InventoryItem from "../models/inventoryItem.js";


export const createInventoryItem = async ( data) =>{
    return await InventoryItem.create(data);
}

export const getInventoryItem = async (item_name) => {
    return await InventoryItem.findOne({ item_name });
};

export const getInventoryItemById = async (id) => {
    return await InventoryItem.findById(id);
};

export const updateInventoryItem = async (id, updateData) => {
    return await InventoryItem.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteInventoryItem = async (id) => {
    return await InventoryItem.findByIdAndDelete(id);
};

export const getAllInventoryItems = async () => {
    return await InventoryItem.find();
};