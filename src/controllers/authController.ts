import bcrypt from "bcrypt";
import { FastifyReply, FastifyRequest } from "fastify";
import { appDataSource } from "../app-data-source";
import { Account } from "../entities/account.entity";
import { BadRequestError } from "../errors/BadRequestError";
import { UAParser } from "ua-parser-js";
import { Device } from "../entities/device.entity";

interface RegisterBody {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
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
    const { email, password, phoneNumber, username, firstName, lastName } =
      request.body;

    //   Check existing account
    const existingAccount = await appDataSource.manager.findOneBy(Account, {
      username,
    });

    if (existingAccount) {
      throw new BadRequestError("Account is already exists.");
    }

    //   Create new account
    const newAccount = new Account();
    const hashedPassword = await bcrypt.hash(password, 12);
    newAccount.username = username;
    newAccount.password = hashedPassword;
    newAccount.email = email;
    newAccount.phoneNumber = phoneNumber;
    newAccount.firstName = firstName;
    newAccount.lastName = lastName;

    // Save account to database
    await appDataSource.manager.save(newAccount);

    reply.code(201).send({ message: "Account is registered successfully." });
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

    // Check existing account
    const existingAccount = await appDataSource.manager.findOneBy(Account, {
      username,
    });

    if (!existingAccount) {
      throw new BadRequestError("Invalid username or password.");
    }

    // Compare password
    const passwordIsValid = await bcrypt.compare(
      password,
      existingAccount.password
    );
    if (!passwordIsValid) {
      throw new BadRequestError("Invalid username or password.");
    }

    // Check device
    const userAgent = {
      userId: existingAccount.id.toString(),
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

    reply.code(200).send({ message: "Account is login successfully." });
  } catch (error) {
    if (error instanceof Error) {
      throw new BadRequestError(error.message);
    }
  }
};
