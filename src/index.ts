import buildApp from "./app";
import closeWithGrace from "close-with-grace";

declare module "fastify" {
  interface FastifyInstance {
    config: {
      PORT: string;
      MONGODB_URL: string;
      JWT_SECRET: string;
    };
  }
}

const start = async () => {
  const app = await buildApp();
  const port = Number(app.config.PORT);

  // Run the server!
  await app.listen({ port }, function (err) {
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
