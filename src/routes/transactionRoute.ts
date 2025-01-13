import { FastifyInstance } from "fastify";
import { TransactionType } from "../types";
import * as transactionController from "../controllers/transactionController";
import * as transactionSchema from "../schemas/transactionSchema";
import Joi from "joi";

const transactionRoute = async function (fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authentication);

  fastify.get(
    "/",
    {
      schema: {
        querystring: transactionSchema.getTransaction,
      },

      validatorCompiler: ({ schema }) => {
        return (data: any) => (schema as unknown as Joi.Schema).validate(data);
      },
    },
    transactionController.getTransaction
  );

  fastify.get(
    "/summary/",
    {
      schema: {
        querystring: transactionSchema.getSummary,
      },

      validatorCompiler: ({ schema }) => {
        return (data: any) => (schema as unknown as Joi.Schema).validate(data);
      },
    },
    transactionController.getSummary
  );

  fastify.get("/summary/month", transactionController.getSummaryMonth);

  fastify.post(
    "/income",
    {
      preValidation: (request, reply, done) => {
        request.body = {
          ...request.body,
          transactionType: TransactionType["INCOME"],
        };
        done();
      },
    },
    transactionController.createTransaction
  );

  fastify.post(
    "/expense",
    {
      preValidation: (request, reply, done) => {
        request.body = {
          ...request.body,
          transactionType: TransactionType["EXPENSE"],
        };
        done();
      },
    },
    transactionController.createTransaction
  );
};

export default transactionRoute;
