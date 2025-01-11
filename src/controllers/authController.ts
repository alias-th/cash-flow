import bcrypt from "bcrypt";
import { FastifyReply, FastifyRequest } from "fastify";
import { appDataSource } from "../app-data-source";
import { Account, Balance } from "../entities/account.entity";
import { BadRequestError } from "../errors/BadRequestError";
import { UAParser } from "ua-parser-js";
import { Device } from "../entities/device.entity";
import { compareToken, createToken, hashToken } from "../utils";
import { Token } from "../entities/token.entity";
import { ObjectId } from "mongodb";

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

interface RefreshTokenBody {
  refreshToken: string;
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
    const balance = new Balance();
    balance.balance = 0;
    const hashedPassword = await bcrypt.hash(password, 12);
    newAccount.username = username;
    newAccount.password = hashedPassword;
    newAccount.email = email;
    newAccount.phoneNumber = phoneNumber;
    newAccount.firstName = firstName;
    newAccount.lastName = lastName;
    newAccount.balance = balance;

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
    const secretMessage = process.env.SECRET_MESSAGE ?? "";

    // Check existing account
    const existingAccount = await appDataSource.manager.findOneBy(Account, {
      username,
    });

    if (!existingAccount) {
      throw new BadRequestError("Invalid username or password.");
    }

    const accountId = existingAccount.id.toString();

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
      accountId,
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
    let newDevice = null;
    if (!existingDevice) {
      const device = new Device();
      const keyOfDevice = Object.keys(userAgent) as (keyof typeof userAgent)[];
      keyOfDevice.forEach((key) => {
        device[key] = userAgent[key];
      });
      newDevice = await appDataSource.manager.save(device);
    }

    // Generate tokens
    const deviceId =
      newDevice?.id?.toString() ?? existingDevice?.id?.toString() ?? "";
    const newToken = createToken(
      accountId,
      deviceId,
      "1d",
      "7d",
      secretMessage
    );

    await appDataSource.manager.save(newToken.token);

    // Send token to user
    reply.code(200).send({
      message: "Account is login successfully.",
      token: {
        value: newToken.plainToken,
        expiredAt: newToken.token.tokenExpiredAt,
      },
      refreshToken: {
        value: newToken.plainRefreshToken,
        expiredAt: newToken.token.refreshTokenExpiredAt,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new BadRequestError(error.message);
    }
  }
};

export const refreshToken = async (
  request: FastifyRequest<{ Body: RefreshTokenBody }>,
  reply: FastifyReply
) => {
  const { refreshToken } = request.body;

  const secretMessage = process.env.SECRET_MESSAGE;

  if (!secretMessage) {
    throw new BadRequestError("Secret message must provided!");
  }

  const hashedRefreshToken = hashToken(refreshToken, secretMessage);

  // Checking existing token
  const existingToken = await appDataSource.manager.findOneBy(Token, {
    refreshToken: hashedRefreshToken,
    revoked: false,
  });

  if (!existingToken) {
    throw new BadRequestError("Invalid refresh token.");
  }

  // Checking valid token
  const isValid = compareToken(
    refreshToken,
    existingToken.refreshToken,
    secretMessage
  );
  if (!isValid) {
    throw new BadRequestError("Invalid refresh token.");
  }

  // Checking expired date
  if (existingToken.refreshTokenExpiredAt < new Date()) {
    throw new BadRequestError("Invalid refresh token.");
  }

  // Generate new token
  const newToken = createToken(
    existingToken.accountId,
    existingToken.deviceId,
    "1d",
    "7d",
    secretMessage
  );
  await appDataSource.manager.save(newToken.token);

  // Revoked old token
  existingToken.revoked = true;
  await appDataSource.manager.save(existingToken);

  reply.code(200).send({
    message: "Token is refreshed successfully!",
    token: {
      value: newToken.plainToken,
      expiredAt: newToken.token.tokenExpiredAt,
    },
    refreshToken: {
      value: newToken.plainRefreshToken,
      expiredAt: newToken.token.refreshTokenExpiredAt,
    },
  });
};

export const removeAccount = async (
  request: FastifyRequest<{ Params: { accountId: string } }>,
  reply: FastifyReply
) => {
  try {
    const { accountId } = request.params;

    const id = new ObjectId(accountId);

    // Check existing account
    const existingAccount = await appDataSource
      .getMongoRepository(Account)
      .findOne({ where: { _id: id } });

    if (!existingAccount) {
      throw new BadRequestError("Account does not exist.");
    }

    // Remove account
    await appDataSource.manager.remove(existingAccount);

    // Remove devices
    await appDataSource
      .getMongoRepository(Device)
      .deleteMany({ accountId: id.toString() });

    // Remove tokens
    await appDataSource
      .getMongoRepository(Token)
      .deleteMany({ accountId: id.toString() });

    reply.code(200).send({ message: "Account is removed successfully." });
  } catch (error) {
    if (error instanceof Error) {
      throw new BadRequestError(error.message);
    }
  }
};
