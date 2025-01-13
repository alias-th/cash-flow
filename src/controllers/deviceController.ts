import { FastifyReply, FastifyRequest } from "fastify";
import { appDataSource } from "../app-data-source";
import { Device } from "../entities/device.entity";
import { BadRequestError } from "../errors/BadRequestError";

export const getAllDevices = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const accountId = request.accountId;
    const deviceRepo = appDataSource.getMongoRepository(Device);
    const allDevices = await deviceRepo.find({
      where: {
        accountId,
      },
    });

    reply.code(200).send({
      message: "Get all devices successfully.",
      devices: allDevices,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new BadRequestError(error.message);
    }
  }
};
