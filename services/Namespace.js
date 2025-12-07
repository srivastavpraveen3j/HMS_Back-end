// services/namespace.service.js
import Namespace from "../models/NameSpace.js";
import CustomError from "../utils/CustomError.js";
import PlatformUser from "../models/PlatformUser.js";

export const createNamespace = async (data) => {
    if (!data.api_Key) {
        data.api_Key = Namespace.generateApiKey();
    }
    const namespace = await Namespace.create(data);
    return namespace;
};

export const getAllNamespaces = async () => {
    return await Namespace.find().populate('subscriptions').sort({ createdAt: -1 });
};

export const getNamespaceById = async (id) => {
    const namespace = await Namespace.findById(id).populate('subscriptions');
    if (!namespace) {
        throw new CustomError("Namespace not found", 404);
    }
    return namespace;
};

export const updateNamespace = async (id, updates) => {
    const namespace = await Namespace.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
    });

    if (!namespace) {
        throw new CustomError("Namespace not found", 404);
    }

    return namespace;
};

// ✅ Delete Namespace
export const deleteNamespace = async (id) => {
    const namespace = await Namespace.findByIdAndDelete(id);
    if (!namespace) {
        throw new CustomError("Namespace not found", 404);
    }
    return { message: "Namespace deleted successfully" };
};

// ✅ Get Namespace by API Key
export const getNamespaceByApiKey = async (apiKey) => {
    const namespace = await Namespace.findOne({ api_Key: apiKey }).populate('subscriptions');
    if (!namespace) {
        throw new CustomError("Invalid API Key", 401);
    }
    return namespace;
};


export async function linkUserToNamespace(user, namespaceData) {
    try {
        let namespace = await Namespace.findOne({ api_Key: namespaceData.api_Key });

        if (!namespace) {
            namespace = await Namespace.create(namespaceData);
        }

        const updatedUser = await PlatformUser.findByIdAndUpdate(
            user._id,
            { namespaceId: namespace._id },
            { new: true }
        ).populate("namespaceId");

        return updatedUser;
    } catch (error) {
        console.error("Error linking user to namespace:", error);
        throw error;
    }
}