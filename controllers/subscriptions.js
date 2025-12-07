import { createSubscriptions, getSubscription, updateSubscriptions, deleteSubscriptions } from "../services/subscriptions.js";
import asyncHandler from "../utils/asyncWrapper.js";
import ErrorHandler from "../utils/CustomError.js";
import { subscriptionValidationSchema } from "../validation/Subcription.js";

export const createSubscriptionController = asyncHandler(async (req, res) => {
    const { error, value } = subscriptionValidationSchema.validate(req.body);

    if (error) {
        throw new ErrorHandler(error);
    }

    const data = await createSubscriptions(value);

    res.status(200).json({ data });
})

export const getSubscriptionController = asyncHandler(async (req, res) => {
    // const sub = req.body;
    const value = await getSubscription();

    res.status(200).json({ value });
})

export const updateSubscriptionController = asyncHandler(async (req, res) => {
    const { error, value } = subscriptionValidationSchema.validate(req.body);
    const id = req.params;
    // if (error) {
    //     throw new ErrorHandler(error);
    // }
    const data = await updateSubscriptions(id, { key: value.key, value: value.value });
    res.status(200).json(data);
})

export const deleteSubscriptionController = asyncHandler(async (req, res) => {
    const id = req.body;
    const value = await deleteSubscriptions(id);
    res.status(200).json(value);
})