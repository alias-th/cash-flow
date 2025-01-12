import Joi from "joi";

export const create = Joi.object().keys({
  categoryId: Joi.string().required().messages({
    "string.empty": "Category ID is required.",
    "any.required": "Category ID is required.",
  }),
  amount: Joi.number().positive().min(1).required().messages({
    "number.base": "Amount must be a number.",
    "number.positive": "Amount must be a positive number.",
    "number.min": "Amount must be at least 1.",
    "any.required": "Amount is required.",
  }),
  description: Joi.object()
    .pattern(Joi.string(), Joi.string())
    .required()
    .messages({
      "object.base": `"description" must be an object.`,
      "object.pattern.base": `"description" keys and values must both be strings.`,
      "any.required": `"description" is required.`,
    }),
  note: Joi.object()
    .pattern(Joi.string(), Joi.string())
    .required()
    .messages({
      "object.base": `"description" must be an object.`,
      "object.pattern.base": `"description" keys and values must both be strings.`,
      "any.required": `"description" is required.`,
    })
    .optional()
    .allow(null),
  file: Joi.any()
    .custom((value, helpers) => {
      if (value === null || value === undefined) {
        return value;
      }

      // Check if the value is a file object
      if (!value?.name || !value?.type) {
        return helpers.error("custom.invalid_file_type");
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png"];
      if (!allowedTypes.includes(value.type)) {
        console.log(value.mimetype, "value.mimetype");

        return helpers.error("custom.invalid_file_type");
      }

      // Validate file size (limit to 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (value?.size > maxSize) {
        return helpers.error("custom.file_size_exceeded");
      }

      return value;
    })
    .messages({
      "custom.invalid_file_type":
        "The file type is invalid. Only JPEG and PNG files are allowed.",
      "custom.file_size_exceeded": "The file size exceeds the 5MB limit.",
    }),
});

export const getTransaction = Joi.object().keys({
  day: Joi.number().integer().min(1).max(31).optional().messages({
    "number.base": "Day must be a number.",
    "number.integer": "Day must be an integer.",
    "number.min": "Day must be between 1 and 12.",
    "number.max": "Day must be between 1 and 12.",
  }),

  month: Joi.number().integer().min(1).max(12).optional().messages({
    "number.base": "Month must be a number.",
    "number.integer": "Month must be an integer.",
    "number.min": "Month must be between 1 and 12.",
    "number.max": "Month must be between 1 and 12.",
  }),

  year: Joi.number().integer().min(1900).optional().messages({
    "number.base": "Year must be a number.",
    "number.integer": "Year must be an integer.",
    "number.min": "Year must be 1900 or greater.",
  }),

  page: Joi.number().integer().min(1).optional().messages({
    "number.base": "Page must be a number.",
    "number.integer": "Page must be an integer.",
    "number.min": "Page must be 1 or greater.",
  }),

  limit: Joi.number().integer().min(1).optional().messages({
    "number.base": "Number must be a number.",
    "number.integer": "Number must be an integer.",
    "number.min": "Number must be 1 or greater.",
  }),

  categoryId: Joi.string().optional().messages({
    "string.base": "Category ID must be a string.",
  }),
});
