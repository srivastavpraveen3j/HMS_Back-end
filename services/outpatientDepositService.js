import outpatientDeposit from "../models/outpatientDepositSchema.js";
export const createOutpatientDeposit = async (data) => {
    try {
        const newOutpatientDeposit = new outpatientDeposit(data);
        const savedOutpatientDeposit = await outpatientDeposit.create(newOutpatientDeposit);
        return savedOutpatientDeposit;
    } catch (error) {
        throw new Error(error);
    }
}

export const getAllOutpatientDeposits = async ({ limit, page, params }) => {
    try {
        const { query } = params;
        return await outpatientDeposit
            .find(query)
            .populate({
                path: "outpatientBillId",  // First, populate the outpatientBillId
                populate: [
                    {
                        path: "patientUhid"
                    },
                    {
                        path: "serviceId"
                    }
                ]
            })
            .skip((page - 1) * limit)
            .limit(limit);

    } catch (error) {
        throw new Error(error);
    }
}

export const getOutpatientDepositById = async (id) => {
    try {
        return await outpatientDeposit.findById(id);
    } catch (error) {
        throw new Error(error);
    }
}

export const deleteOutpatientDeposit = async (id) => {
    try {
        return await outpatientDeposit.findByIdAndDelete(id);
    } catch (error) {
        throw new Error(error);
    }
}

export const updateOutpatientDeposit = async (id, data) => {
    try {
        return await outpatientDeposit.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
        throw new Error(error);
    }
}