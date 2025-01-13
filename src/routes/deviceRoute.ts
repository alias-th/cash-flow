import { FastifyInstance } from "fastify";
import * as deviceController from "../controllers/deviceController";

const deviceRoute = async function (fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authentication);
  fastify.get("/", deviceController.getAllDevices);
};

export default deviceRoute;
