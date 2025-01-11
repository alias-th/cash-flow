import { FastifyInstance } from "fastify";
import Joi from "joi";
import * as categorySchema from "../schemas/categorySchema";
import * as categoryController from "../controllers/categoryController";

const categoryRoute = async function (fastify: FastifyInstance) {
  fastify.post(
    "/",
    {
      schema: {
        body: categorySchema.create,
      },
      validatorCompiler: ({ schema }) => {
        return (data: any) => {
          if (typeof data.transactionType === "string") {
            const transactionType = data.transactionType as string;
            data.transactionType = transactionType.toLowerCase();
          }
          return (schema as unknown as Joi.Schema).validate(data);
        };
      },
    },
    categoryController.addCategory
  );

  fastify.delete(
    "/:categoryId",
    {
      schema: {
        params: categorySchema.remove,
      },

      validatorCompiler: ({ schema }) => {
        return (data: any) => (schema as unknown as Joi.Schema).validate(data);
      },
    },
    categoryController.removeCategory
  );
};

export default categoryRoute;
