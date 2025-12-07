import Joi from "joi";
import mongoose from "mongoose";

const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
}, "ObjectId validation");

const insuranceCompanyJoiSchema = Joi.object({
  company_name: Joi.string().trim().required(),

  registration_number: Joi.string().trim().optional(),

  address: Joi.string().trim().optional(),
  city: Joi.string().trim().optional(),
  state: Joi.string().trim().optional(),
  country: Joi.string().trim().optional(),
  pincode: Joi.string().trim().optional(),

  gst_number: Joi.string().trim().optional(),
  pan_number: Joi.string().trim().optional(),

  agreement_start_date: Joi.date().optional(),
  agreement_end_date: Joi.date()
    .optional()
    .greater(Joi.ref("agreement_start_date"))
    .messages({
      "date.greater": `"agreement_end_date" must be after "agreement_start_date"`,
    }),

  remarks: Joi.string().trim().optional(),

  is_active: Joi.boolean().optional(),

  created_by: objectId.optional(),
});

export default insuranceCompanyJoiSchema;
