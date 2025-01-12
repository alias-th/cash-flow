import { appDataSource } from "../app-data-source";
import { Account } from "../entities/account.entity";
import { Category } from "../entities/category.entity";
import { Device } from "../entities/device.entity";
import { Token } from "../entities/token.entity";
import { Transaction } from "../entities/transaction.entity";

const runDownMigration = async () => {
  try {
    const connection = await appDataSource.initialize();
    await connection.getMongoRepository(Account).clear();
    await connection.getMongoRepository(Transaction).clear();
    await connection.getMongoRepository(Device).clear();
    await connection.getMongoRepository(Token).clear();
    await connection.getMongoRepository(Category).clear();

    connection.destroy();
    process.exit(1);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

runDownMigration();
