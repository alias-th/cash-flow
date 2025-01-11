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
