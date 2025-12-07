import ThirdPartyAdministratorClaim from "../models/ThirdPartyAdministratorClaimSchema.js";

export const createThirdPartyAdministrator = async (thirdPartyAdministrator) => {
    try {
        const newThirdPartyAdministrator = await ThirdPartyAdministratorClaim.create(thirdPartyAdministrator);
        return newThirdPartyAdministrator;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const getAllThirdPartyAdministrator = async ({ limit, page, params }) => {
    try {
        const { query } = params;
        const thirdPartyAdministrators = await ThirdPartyAdministratorClaim.find(query).skip((page - 1) * limit).limit(limit);
        const total = await ThirdPartyAdministratorClaim.countDocuments(query);
        const totalPages = Math.ceil(total / limit);
        return { total, page, totalPages, limit, thirdPartyAdministrators };
    } catch (error) {
        throw new Error(error.message);
    }
};

export const getThirdPartyAdministratorById = async (id) => {
    try {
        const thirdPartyAdministrator = await ThirdPartyAdministratorClaim.findById(id);
        return thirdPartyAdministrator;
    } catch (error) {
        throw new Error(error.message);
    }
};


export const deleteThirdPartyAdministrator = async (id) => {
    try {
        const deletedThirdPartyAdministrator = await ThirdPartyAdministratorClaim.findByIdAndDelete(id);
        return deletedThirdPartyAdministrator;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const updateThirdPartyAdministrator = async (id, updatedThirdPartyAdministrator) => {
    try {
        const thirdPartyAdministrator = await ThirdPartyAdministratorClaim.findByIdAndUpdate(id, updatedThirdPartyAdministrator, { new: true });
        return thirdPartyAdministrator;
    } catch (error) {
        throw new Error(error.message);
    }
}