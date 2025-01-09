import bcrypt from "bcrypt";
import { FastifyReply, FastifyRequest } from "fastify";
import { appDataSource } from "../app-data-source";
import { User } from "../entities/user.entity";
import { BadRequestError } from "../errors/BadRequestError";
import { UAParser } from "ua-parser-js";
import { Device } from "../entities/device.entity";

interface RegisterBody {
  username: string;
  password: string;
  email: string;
  phoneNumber: string;
}
interface LoginBody {
  username: string;
  password: string;
}

export const register = async (
  request: FastifyRequest<{ Body: RegisterBody }>,
  reply: FastifyReply
) => {
  try {
    const { email, password, phoneNumber, username } = request.body;

    //   Check existing username
    const existingUser = await appDataSource.manager.findOneBy(User, {
      username,
    });

    if (existingUser) {
      throw new BadRequestError("Username is already exists.");
    }

    //   Create new user
    const newUser = new User();
    const hashedPassword = await bcrypt.hash(password, 12);
    newUser.username = username;
    newUser.password = hashedPassword;
    newUser.email = email;
    newUser.phoneNumber = phoneNumber;

    // Save user to database
    await appDataSource.manager.save(newUser);

    reply.code(201).send({ message: "User is registered successfully." });
  } catch (error) {
    if (error instanceof Error) {
      throw new BadRequestError(error.message);
    }
  }
};

export const login = async (
  request: FastifyRequest<{ Body: LoginBody }>,
  reply: FastifyReply
) => {
  try {
    const { username, password } = request.body;
    const { browser, device, os } = UAParser(request.headers["user-agent"]);
    const userIp = request.ip;

    // Check existing user
    const existingUser = await appDataSource.manager.findOneBy(User, {
      username,
    });

    if (!existingUser) {
      throw new BadRequestError("Invalid username or password.");
    }

    // Compare password
    const passwordIsValid = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!passwordIsValid) {
      throw new BadRequestError("Invalid username or password.");
    }

    // Check device
    const userAgent = {
      userId: existingUser.id.toString(),
      browser: browser.name ?? "Unknown",
      deviceName: device.model ?? "Unknown",
      deviceType: device.type ?? "Unknown",
      os: os.name ?? "Unknown",
      ipAddress: userIp,
    };

    const existingDevice = await appDataSource.manager.findOneBy(Device, {
      ...userAgent,
    });

    // Create new device if not exists
    let userDevice = null;
    if (!existingDevice) {
      const device = new Device();
      const keyOfDevice = Object.keys(userAgent) as (keyof typeof userAgent)[];
      keyOfDevice.forEach((key) => {
        device[key] = userAgent[key];
      });
      userDevice = await appDataSource.manager.save(device);
    }

    reply.code(200).send({ message: "User is login successfully." });
  } catch (error) {
    if (error instanceof Error) {
      throw new BadRequestError(error.message);
    }
  }
};
