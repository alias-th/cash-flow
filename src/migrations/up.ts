import { appDataSource } from "../app-data-source";
import { Account } from "../entities/account.entity";
import { Category } from "../entities/category.entity";
import { Device } from "../entities/device.entity";
import { Token } from "../entities/token.entity";
import { Transaction } from "../entities/transaction.entity";
import account from "../data/account.json";
import transaction from "../data/transaction.json";
import category from "../data/category.json";
import device from "../data/device.json";
import token from "../data/token.json";
import { ObjectId } from "mongodb";

const runUpMigration = async () => {
  try {
    const connection = await appDataSource.initialize();
    const accountWithId = account.map((item) => {
      return { ...item, _id: new ObjectId(item._id) };
    });

    const transactionWithId = transaction.map((item) => {
      return {
        ...item,
        _id: new ObjectId(item._id),
        createdAt: new Date(item.createdAt),
      };
    });

    const categoryWithId = category.map((item) => {
      return { ...item, _id: new ObjectId(item._id) };
    });

    const deviceWithId = device.map((item) => {
      return { ...item, _id: new ObjectId(item._id) };
    });

    const tokenWithId = token.map((item) => {
      return {
        ...item,
        _id: new ObjectId(item._id),
        tokenExpiredAt: new Date(item.tokenExpiredAt),
        refreshTokenExpiredAt: new Date(item.refreshTokenExpiredAt),
      };
    });

    await connection.getMongoRepository(Account).insertMany(accountWithId);
    await connection.getMongoRepository(Category).insertMany(categoryWithId);
    await connection.getMongoRepository(Device).insertMany(deviceWithId);
    await connection.getMongoRepository(Token).insertMany(tokenWithId);
    await connection
      .getMongoRepository(Transaction)
      .insertMany(transactionWithId);

    connection.destroy();
    process.exit(1);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runUpMigration();
