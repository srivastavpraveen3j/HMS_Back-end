import Joi from 'joi';
// import {ROLES}  from '../constants/ROLES.js';

export default Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  role: Joi.string().required()
});