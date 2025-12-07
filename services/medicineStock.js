import MedicineStock from "../models/medicineStock.js";
    
export const getStockById = async (id) => {
    return await MedicineStock.findById(id);
};

export const getStock = async (medicineGroupName) => {
    return await MedicineStock.findOne({medicineGroupName});
};

export const deleteStock = async (id) => {
    return await MedicineStock.findByIdAndDelete(id);
};

export const updateStock = async (id, data) => {
    return await MedicineStock.findByIdAndUpdate(id, data);
}

export const createStock = async (data) => {
    return await MedicineStock.create(data);
}

export const getAllStocks = async ({limit, page, params}) => {
    const {query} = params;
    const stocks = await MedicineStock.find(query).populate("medicines").skip((page - 1) * limit).limit(limit);
    const total = await MedicineStock.countDocuments(query);
    return  {total, page, totalPages: Math.ceil(total / limit), limit, stocks};
}