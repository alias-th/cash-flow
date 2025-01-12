import crypto from "crypto";
import { Token } from "../entities/token.entity";
import { BadRequestError } from "../errors/BadRequestError";
import badWordsList from "../data/bad-words-list.json";

export const generateToken = () => {
  const tokenValue = crypto.randomBytes(32).toString("hex");

  return tokenValue;
};

export const hashToken = (token: string, message: string): string => {
  return crypto.createHmac("sha256", message).update(token).digest("hex");
};

export const verifyToken = async (
  token: string,
  existingToken: Token,
  secretMessage: string
) => {
  const isValid = compareToken(token, existingToken.token, secretMessage);

  if (!isValid) {
    console.error("Invalid token.");
    return false;
  }

  if (existingToken.tokenExpiredAt < new Date()) {
    console.error("Token is expired.");
    return false;
  }

  return true;
};

export const getSecretMessage = () => {
  const secretMessage = process.env.SECRET_MESSAGE;
  if (!secretMessage) {
    throw new BadRequestError("Secret message must provided!");
  }
  return secretMessage;
};

export const parseExpirationString = (expiration: string): Date => {
  const regex = /^(\d+)([dhms])$/;
  const match = regex.exec(expiration);
  if (!match) {
    throw new Error("Invalid expiration format.");
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];
  const expirationDate = new Date();

  switch (unit) {
    case "d":
      expirationDate.setDate(expirationDate.getDate() + value);
      break;
    case "h":
      expirationDate.setHours(expirationDate.getHours() + value);
      break;
    case "m":
      expirationDate.setMinutes(expirationDate.getMinutes() + value);
      break;
    case "s":
      expirationDate.setSeconds(expirationDate.getSeconds() + value);
      break;
    default:
      throw new Error("Invalid expiration unit");
  }

  return expirationDate;
};

export const createToken = (
  accountId: string,
  deviceId: string,
  tokenExpiresIn: string,
  refreshTokenExpiresIn: string,
  message: string
) => {
  const plainToken = generateToken();
  const plainRefreshToken = generateToken();
  const expirationToken = parseExpirationString(tokenExpiresIn);
  const expirationRefreshToken = parseExpirationString(refreshTokenExpiresIn);
  const hashedToken = hashToken(plainToken, message);
  const hashedRefreshToken = hashToken(plainRefreshToken, message);

  const token = new Token();
  token.accountId = accountId;
  token.deviceId = deviceId;
  token.token = hashedToken;
  token.refreshToken = hashedRefreshToken;
  token.tokenExpiredAt = expirationToken;
  token.refreshTokenExpiredAt = expirationRefreshToken;
  token.revoked = false;

  return { token, plainToken, plainRefreshToken };
};

export const compareToken = (
  plainToken: string,
  hashedToken: string,
  message: string
): boolean => {
  const hashedPlainToken = hashToken(plainToken, message);
  return hashedPlainToken === hashedToken;
};

export const replaceBadWords = (
  text: string,
  replacementChar: string = "*"
) => {
  if (!text) return text;

  const badWords = badWordsList.words || [];
  if (!badWords.length) return text;

  const escapedWords = badWords.map((word) =>
    word.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&")
  );

  try {
    const regex = new RegExp(`\\b(${escapedWords.join("|")})\\b`, "gi");
    return text.replace(regex, (match) => replacementChar.repeat(match.length));
  } catch (error) {
    console.error("Error constructing regex:", error);
    return text;
  }
};
