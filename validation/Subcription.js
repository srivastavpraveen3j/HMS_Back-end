import Joi from "joi";

export const subscriptionValidationSchema = Joi.object({
  status: Joi.string()
    .valid("active", "inactive", "expired", "pending")
    .default("pending"),
  startDate: Joi.date().default(() => new Date()), // ✅ fixed
  endDate: Joi.date().allow(null),
});
