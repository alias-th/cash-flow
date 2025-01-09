import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyEnv from "@fastify/env";
import authRoutes from "./routes/authRoute";

const envOptions = {
  dotenv: true,
  schema: {
    type: "object",
    required: ["PORT", "MONGODB_HOST", "MONGODB_PORT", "MONGODB_DATABASE"],
    properties: {
      PORT: {
        type: "string",
        default: 8000,
      },
      MONGODB_HOST: {
        type: "string",
      },
      MONGODB_PORT: {
        type: "string",
      },
      MONGODB_DATABASE: {
        type: "string",
      },
    },
  },
};

async function buildApp() {
  let logger;

  if (process.stdout.isTTY) {
    logger = {
      transport: {
        target: "pino-pretty",
      },
    };
  } else {
    logger = true;
  }

  const fastify = Fastify({ logger });

  await fastify.register(cors);

  await fastify.register(fastifyEnv, envOptions);

  fastify.register(authRoutes, { prefix: "/api/auth" });

  fastify.setErrorHandler(async function (error, request, reply) {
    request.log.error({ error });

    reply.code(error.statusCode ?? 500);
    return { error: { message: error.message, statusCode: error.statusCode } };
  });

  fastify.setNotFoundHandler(async (_request, reply) => {
    reply.code(404);
    return { error: { message: "Route is not found." } };
  });

  return fastify;
}

export default buildApp;
