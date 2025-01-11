import Joi from "joi";
import { TransactionType } from "../types";

export const create = Joi.object({
  categoryName: Joi.object()
    .pattern(Joi.string(), Joi.string())
    .required()
    .messages({
      "object.base": `"categoryName" must be an object.`,
      "object.pattern.base": `"categoryName" keys and values must both be strings.`,
      "any.required": `"categoryName" is required.`,
    }),
  transactionType: Joi.string()
    .valid(TransactionType.INCOME, TransactionType.EXPENSE)
    .required()
    .messages({
      "string.base": `"transactionType" must be a string.`,
      "any.only": `"transactionType" must be one of [${TransactionType.INCOME}, ${TransactionType.EXPENSE}].`,
      "any.required": `"transactionType" is required.`,
    }),
});

export const remove = Joi.object().keys({
  categoryId: Joi.string().required().messages({
    "string.empty": "Category ID is required.",
    "any.required": "Category ID is required.",
  }),
});
