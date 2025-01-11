import "reflect-metadata";
import buildApp from "./app";
import closeWithGrace from "close-with-grace";
import { appDataSource } from "./app-data-source";
import { FastifyReply } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    config: {
      PORT: string;
      MONGODB_HOST: string;
      MONGODB_PORT: string;
      MONGODB_DATABASE: string;
      SECRET_MESSAGE: string;
    };

    authentication(
      request: FastifyRequest,
      reply: FastifyReply,
      done: (err?: Error) => void
    ): void;
  }

  interface FastifyRequest {
    accountId: string;
  }
}

const start = async () => {
  // Establish database connection
  try {
    await appDataSource.initialize();
    console.log("Data Source has been initialized!");
  } catch (error) {
    console.error("Error during Data Source initialization:", error);
    process.exit(1);
  }

  const app = await buildApp();
  const port = Number(app.config.PORT);

  app.listen({ port }, function (err) {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
  });

  closeWithGrace(async ({ signal, err, manual }) => {
    if (err) {
      app.log.error({ err }, "server closing with error");
    } else {
      app.log.info(`${signal} received, server closing`);
    }

    await app.close();
  });
};

start();
