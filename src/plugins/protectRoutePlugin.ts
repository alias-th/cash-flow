import { FastifyPluginCallback, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import { getSecretMessage, hashToken, verifyToken } from "../utils";
import { appDataSource } from "../app-data-source";
import { Token } from "../entities/token.entity";
import { NotAuthorizedError } from "../errors/NotAuthorizedError";

const protectRoutePlugin: FastifyPluginCallback = fp(function (
  fastify,
  _opts,
  done
) {
  fastify.decorate(
    "authentication",
    async function (
      request: FastifyRequest,
      _reply: FastifyReply,
      done: (err?: Error) => void
    ) {
      try {
        // Get token
        const token = request.headers["authorization"];
        if (!token) {
          throw new Error("Authorization token is missing");
        }
        const plainToken = token.startsWith("Bearer ") ? token.slice(7) : token;

        // Validate token
        const secretMessage = getSecretMessage();
        const hashedRefreshToken = hashToken(plainToken, secretMessage);
        const existingToken = await appDataSource.manager.findOneBy(Token, {
          token: hashedRefreshToken,
          revoked: false,
        });

        if (!existingToken) {
          console.error("Not existing token.");
          throw new NotAuthorizedError("Invalid token.");
        }

        const validToken = await verifyToken(
          plainToken,
          existingToken,
          secretMessage
        );

        if (!validToken) {
          throw new NotAuthorizedError("Invalid token.");
        }

        request.accountId = existingToken.accountId;
      } catch (error) {
        if (error instanceof Error) {
          throw new NotAuthorizedError(error.message);
        }
      }
    }
  );

  done();
});

export default protectRoutePlugin;
