import { DataSource } from "typeorm";
import { User } from "./entities/user.entity";
import { Token } from "./entities/token.entity";
import { Category } from "./entities/category.entity";
import { Device } from "./entities/device.entity";
import { Transaction } from "./entities/transaction.entity";
import dotenv from "dotenv";

dotenv.config();

function initDatabase() {
  const inValidEnv =
    !process.env.MONGODB_HOST ||
    !process.env.MONGODB_PORT ||
    !process.env.MONGODB_DATABASE;

  if (inValidEnv) {
    throw new Error("Must provide host and port!");
  }

  const port = Number(process.env.MONGODB_PORT ?? 27017);
  const host = process.env.MONGODB_HOST ?? "localhost";
  const database = process.env.MONGODB_DATABASE ?? "cash-flow";

  const dataSource = new DataSource({
    type: "mongodb",
    host,
    port,
    database,
    entities: [User, Token, Category, Device, Transaction],
    logging: true,
    synchronize: process.env.NODE_ENV !== "production",
  });

  return dataSource;
}

export const appDataSource = initDatabase();
