import { FastifyInstance } from "fastify";
import * as transactionController from "../controllers/transactionController";

const transactionRoute = async function (fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authentication);

  fastify.post("/income", transactionController.income);
};

export default transactionRoute;
