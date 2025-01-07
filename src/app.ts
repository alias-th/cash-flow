import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyEnv from "@fastify/env";

const envOptions = {
  dotenv: true,
  schema: {
    type: "object",
    required: ["PORT", "MONGODB_URL"],
    properties: {
      PORT: {
        type: "string",
        default: 8000,
      },
      MONGODB_URL: {
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

  return fastify;
}

export default buildApp;
