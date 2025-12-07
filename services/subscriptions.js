import subscription from "../models/subscription.js";

export const createSubscriptions = async (value) => {
    const data = await subscription.create(value);
    return data;
}
export const getAllSubscriptions = async () => {
    return await subscription.find({});
}
export const getSubscription = async (id) => {
    const data = await subscription.find({ _id: id });
    return data;
}
export const updateSubscriptions = async (id, key, value) => {
    const data = await subscription.findOneAndUpdate(
        { _id: id },
        { $set: { [key]: value } },
        { new: true }
    )
    return data;
}
export const deleteSubscriptions = async (id) => {
    const deleted = await subscription.findOneAndDelete({ _id: id });
    return deleted;
}