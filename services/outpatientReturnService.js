import OutpatientReturn from "../models/outpatientReturnSchema.js";

export const createOutpatientReturn = async (data) => {
    try {
        const newOutpatientReturn = new OutpatientReturn(data);
        const savedOutpatientReturn = await OutpatientReturn.create(newOutpatientReturn);
        return savedOutpatientReturn;
    } catch (error) {
        throw new Error(error);
    }
};


export const getAllOutpatientReturns = async ({ limit, page, params }) => {
    try {
        const { query } = params;
        const outpatientReturns = await OutpatientReturn
            .find(query)
            .populate("outpatientDepositId")
            .populate({
                path: "outpatientBillId",
                populate: {
                    path: "patientUhid"
                }
            })
            .skip((page - 1) * limit)
            .limit(limit);
        const total = await OutpatientReturn.countDocuments(query);
        return { total, page, totalPages: Math.ceil(total / limit), limit, outpatientReturns };
    } catch (error) {
        throw new Error(error);
    }
}

export const getOutpatientReturnById = async (id) => {
    try {
        return await OutpatientReturn.findById(id);
    } catch (error) {
        throw new Error(error);
    }
}

export const deleteOutpatientReturn = async (id) => {
    try {
        return await OutpatientReturn.findByIdAndDelete(id);
    } catch (error) {
        throw new Error(error);
    }
}

export const updateOutpatientReturn = async (id, data) => {
    try {
        return await OutpatientReturn.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
        throw new Error(error);
    }
}
