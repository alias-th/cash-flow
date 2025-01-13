import { FastifyInstance } from "fastify";
import * as authController from "../controllers/authController";
import * as authSchema from "../schemas/authSchema";
import Joi from "joi";

const authRoutes = async function (fastify: FastifyInstance) {
  fastify.post(
    "/register",
    {
      schema: {
        body: authSchema.register,
      },
      validatorCompiler: ({ schema }) => {
        return (data: any) => (schema as unknown as Joi.Schema).validate(data);
      },
    },
    authController.register
  );

  fastify.post(
    "/login",
    {
      schema: {
        body: authSchema.login,
      },
      validatorCompiler: ({ schema }) => {
        return (data: any) => (schema as unknown as Joi.Schema).validate(data);
      },
    },
    authController.login
  );

  fastify.post(
    "/refresh-token",
    {
      schema: {
        body: authSchema.refreshToken,
      },
      validatorCompiler: ({ schema }) => {
        return (data: any) => (schema as unknown as Joi.Schema).validate(data);
      },
    },
    authController.refreshToken
  );

  fastify.route({
    method: "POST",
    url: "/logout/device/:deviceId",
    schema: {
      params: authSchema.logoutByDeviceId,
    },
    preHandler: fastify.authentication,
    validatorCompiler: ({ schema }) => {
      return (data: any) => (schema as unknown as Joi.Schema).validate(data);
    },
    handler: authController.logoutByDeviceId,
  });

  fastify.route({
    method: "DELETE",
    url: "/remove-account/:accountId",
    schema: {
      params: authSchema.removeAccount,
    },
    preHandler: fastify.authentication,
    validatorCompiler: ({ schema }) => {
      return (data: any) => (schema as unknown as Joi.Schema).validate(data);
    },
    handler: authController.removeAccount,
  });
};

export default authRoutes;
