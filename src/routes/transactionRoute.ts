import { FastifyInstance } from "fastify";
import * as transactionController from "../controllers/transactionController";
import { TransactionType } from "../types";

const transactionRoute = async function (fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authentication);

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
