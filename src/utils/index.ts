import crypto from "crypto";
import { Token } from "../entities/token.entity";
import { TokenType } from "../types";

export const generateToken = () => {
  const tokenValue = crypto.randomBytes(32).toString("hex");

  return tokenValue;
};

export const hashToken = (token: string, message: string): string => {
  return crypto.createHmac("sha256", message).update(token).digest("hex");
};

export const createToken = (
  accountId: string,
  deviceId: string,
  tokenType: TokenType,
  expiresInHours: number,
  message: string
): { token: Token; plainToken: string } => {
  const plainToken = generateToken();
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + expiresInHours);
  const hashedToken = hashToken(plainToken, message);

  const token = new Token();
  token.accountId = accountId;
  token.deviceId = deviceId;
  token.token = hashedToken;
  token.tokenType = tokenType;
  token.expiresAt = expiration;
  token.revoked = false;

  return { token, plainToken };
};

export const compareToken = (
  plainToken: string,
  hashedToken: string,
  message: string
): boolean => {
  const hashedPlainToken = hashToken(plainToken, message);
  return hashedPlainToken === hashedToken;
};
