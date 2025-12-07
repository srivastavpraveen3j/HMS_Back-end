import FinalBill from "../models/FinalBillingSchema.js";

export const createFinalBill = async (finalBillData) => {
    try {
        return await FinalBill.create(finalBillData);
    } catch (error) {
        console.error("Error creating final bill:", error);
        throw error;
    }
};

export const getAllFinalBills = async () => {
    try {
        const finalBills = await FinalBill.find();
        return finalBills;
    } catch (error) {
        console.error("Error retrieving final bill history:", error);
        throw error;
    }
}

export const getFinalBillByUhid = async (uhid) => {
    try {
        const finalBill = await FinalBill.findOne({ uhid });
        return finalBill;
    } catch (error) {
        console.error("Error retrieving final bill by UHID:", error);
        throw error;
    }
};

export const getFinalBillById = async (id) => {
    try {
        const finalBill = await FinalBill.findById(id);
        return finalBill;
    } catch (error) {
        console.error("Error retrieving final bill by ID:", error);
        throw error;
    }
};

export const updateFinalBill = async (id, finalBillData) => {
    try {
        const updatedFinalBill = await FinalBill.findByIdAndUpdate(id, { $set: finalBillData }, { new: true });
        return updatedFinalBill;
    } catch (error) {
        console.error("Error updating final bill:", error);
        throw error;
    }
};

export const deleteFinalBill = async (id) => {
    try {
        const deletedFinalBill = await FinalBill.findByIdAndDelete(id);
        return deletedFinalBill;
    } catch (error) {
        console.error("Error deleting final bill:", error);
        throw error;
    }
}