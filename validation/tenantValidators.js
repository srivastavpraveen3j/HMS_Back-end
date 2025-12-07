import Joi from 'joi';

export const createTenantSchema = Joi.object({
  name: Joi.string().max(100).required(),
  namespace: Joi.string().trim().lowercase().required(),
  contact_email: Joi.string().email().required()
});
