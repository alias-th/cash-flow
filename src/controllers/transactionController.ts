import util from "util";
import { pipeline, Readable } from "stream";
import path from "path";
import fs from "fs";
import { FastifyReply, FastifyRequest } from "fastify";
import { appDataSource } from "../app-data-source";
import { Account } from "../entities/account.entity";
import { ObjectId } from "mongodb";
import * as transactionSchema from "../schemas/transactionSchema";
import { BadRequestError } from "../errors/BadRequestError";
import { Category } from "../entities/category.entity";
import { v4 as uuidv4 } from "uuid";
import { Transaction } from "../entities/transaction.entity";
import { MultiLang, TransactionType } from "../types";

interface CreateTransactionBody {
  categoryId: string;
  amount: number;
  description: string;
  note?: string;
  transactionType: TransactionType;
}

const pipelineAsync = util.promisify(pipeline);

export const createTransaction = async (
  request: FastifyRequest<{ Body: CreateTransactionBody }>,
  reply: FastifyReply
) => {
  const transactionType = request.body.transactionType;
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const accountId = request.accountId;
    let body: { [key: string]: unknown } = {};

    // Validate Body
    body["categoryId"] = formData.get("categoryId");
    body["amount"] = formData.get("amount");
    body["description"] = formData.get("description");
    body["note"] = formData.get("note");
    body["file"] = file;
    if (typeof body.description === "string") {
      body.description = JSON.parse(body.description);
    }
    if (typeof body.note === "string") {
      body.note = JSON.parse(body.note);
    }

    const { error, value } = transactionSchema.create.validate(body);
    if (error) {
      throw new BadRequestError(error.message);
    }
    const validatedValue = value as {
      categoryId: string;
      amount: number;
      description: MultiLang;
      note?: MultiLang;
    };

    // Validate category
    const categoryIdBSON = new ObjectId(validatedValue.categoryId);
    const existingCategory = await appDataSource.manager
      .getMongoRepository(Category)
      .findOne({
        where: {
          _id: categoryIdBSON,
        },
      });
    if (!existingCategory) {
      throw new BadRequestError("Category is not exists.");
    }

    // Get current user
    const accountIdBSON = new ObjectId(accountId);
    const existingAccount = await appDataSource.manager
      .getMongoRepository(Account)
      .findOne({
        where: {
          _id: accountIdBSON,
        },
      });
    if (!existingAccount) {
      throw new BadRequestError("A is not exists.");
    }

    // Calculate balance
    const amount = validatedValue.amount;
    const oldBalance = existingAccount.balance.balance;
    let newBalance = 0;
    if (transactionType === TransactionType["INCOME"]) {
      newBalance = oldBalance + amount;
    } else {
      newBalance = oldBalance - amount;
    }

    // Save transaction
    const newTransaction = new Transaction();
    newTransaction.accountId = accountId;
    newTransaction.categoryId = validatedValue.categoryId;
    newTransaction.amount = amount;
    newTransaction.balance = newBalance;
    newTransaction.description = validatedValue.description;
    if (validatedValue.note) {
      newTransaction.note = validatedValue.note;
    }
    newTransaction.createdAt = new Date();
    newTransaction.transactionType = transactionType;

    // Save file
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const bufferNode = Buffer.from(arrayBuffer);
      const fileId = uuidv4();
      const fileFormat = file.name.split(".");
      const fileFormatLength = fileFormat.length - 1;
      const saveTo = path.join(
        __dirname,
        "..",
        "uploads",
        "slips",
        `${fileId}.${fileFormat[fileFormatLength]}`
      );
      const bufferStream = Readable.from(bufferNode);
      await pipelineAsync(bufferStream, fs.createWriteStream(saveTo));
      newTransaction.transactionSlipId = fileId;
    }

    // Update balance
    existingAccount.balance.balance = newBalance;

    await appDataSource.manager.save(existingAccount);
    await appDataSource.manager.save(newTransaction);

    reply.code(200).send({
      message: "Create transaction successfully.",
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new BadRequestError(error.message);
    }
  }
};
