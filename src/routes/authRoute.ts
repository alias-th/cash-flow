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
};

export default authRoutes;
