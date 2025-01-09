import Joi from "joi";

export const register = Joi.object().keys({
  username: Joi.string().required().messages({
    "string.empty": "Username is required.",
    "any.required": "Username is required.",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required.",
    "string.min": "Password must be at least 6 characters long.",
    "any.required": "Password is required.",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required.",
    "string.email": "Email must be a valid email address.",
    "any.required": "Email is required.",
  }),
  phoneNumber: Joi.string().required().messages({
    "string.empty": "Phone number is required.",
    "any.required": "Phone number is required.",
  }),
});

export const login = Joi.object().keys({
  username: Joi.string().required().messages({
    "string.empty": "Username is required.",
    "any.required": "Username is required.",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required.",
    "any.required": "Password is required.",
  }),
});
