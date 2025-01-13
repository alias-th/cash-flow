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
import { replaceBadWords } from "../utils";

interface CreateTransactionBody {
  categoryId: string;
  amount: number;
  description: string;
  note?: string;
  transactionType: TransactionType;
}

interface GetTransactionParams {
  month?: number;
  year?: number;
  day?: number;
  categoryId?: string;
  page: number;
  limit: number;
}

interface GetSummaryPeriodBody {
  start: string;
  end: string;
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

    // Checking bad words
    const description = validatedValue.description;
    const note = validatedValue.note || {};
    const keysDescription = Object.keys(description);
    const keysNote = Object.keys(note);
    keysDescription.forEach((key) => {
      description[key] = replaceBadWords(description[key]);
    });
    keysNote.forEach((key) => {
      note[key] = replaceBadWords(note[key]);
    });

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
    newTransaction.description = description;
    if (validatedValue.note) {
      newTransaction.note = note;
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

export const getTransaction = async (
  request: FastifyRequest<{ Querystring: GetTransactionParams }>,
  reply: FastifyReply
) => {
  try {
    const accountId = request.accountId;
    const {
      categoryId,
      month,
      year,
      day,
      page: queryPage,
      limit: queryLimit,
    } = request.query;
    let filter: { [key: string]: { [key: string]: string | Date } | string } =
      {};

    // Filter year month day
    if (year && month && day) {
      const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
      const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

      filter.createdAt = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    } else if (year && month) {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0); // Last day of the month

      filter.createdAt = {
        $gte: startOfMonth,
        $lte: endOfMonth,
      };
    } else if (year) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31);

      filter.createdAt = {
        $gte: startOfYear,
        $lte: endOfYear,
      };
    }

    // Filter account id
    if (accountId) {
      filter.accountId = accountId;
    }

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    console.log(filter, "filter");
    const page = queryPage || 1;
    const limit = queryLimit || 10;
    const skip = (page - 1) * limit;
    const totalCount = await appDataSource
      .getMongoRepository(Transaction)
      .find({
        where: filter,
      });
    const totalPages = Math.ceil(totalCount.length / limit);
    const isMaxPage = page >= totalPages;

    const result = await appDataSource
      .getMongoRepository(Transaction)
      .aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "account",
            let: { account_id: { $toObjectId: "$accountId" } },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$account_id"],
                  },
                },
              },
              {
                $project: {
                  username: 1,
                  email: 1,
                  firstName: 1,
                  lastName: 1,
                  balance: 1,
                  _id: 1,
                },
              },
            ],
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $project: {
            user: 1,
            amount: 1,
            description: 1,
            note: 1,
            transactionType: 1,
            categoryId: 1,
            accountId: 1,
          },
        },
        {
          $sort: { createdAt: 1 },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ])
      .toArray();

    reply.code(200).send({
      message: "Get transaction successfully.",
      items: result,
      isMaxPage,
      totalCount: totalCount.length,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new BadRequestError(error.message);
    }
  }
};

export const getSummaryMonth = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const accountId = request.accountId;
    const repository = appDataSource.getMongoRepository(Transaction);
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startOfMonth = new Date(year, month, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    console.log(startOfMonth, endOfMonth);

    // Aggregate by transaction type
    const summaryTransaction = (await repository
      .aggregate([
        {
          $match: {
            accountId,
            createdAt: {
              $gte: startOfMonth,
              $lte: endOfMonth,
            },
          },
        },
        {
          $group: {
            _id: {
              transactionType: "$transactionType",
            },
            totalAmount: { $sum: "$amount" },
            transactionCount: { $sum: 1 },
            averageAmount: { $avg: "$amount" },
          },
        },
        {
          $project: {
            _id: 0,
            transactionType: "$_id.transactionType",
            totalAmount: 1,
            transactionCount: 1,
            averageAmount: 1,
          },
        },
      ])
      .toArray()) as any;

    const totalIncome =
      summaryTransaction?.find((item: any) => {
        return item.transactionType === TransactionType["INCOME"];
      })?.totalAmount || 0;

    const totalExpense =
      summaryTransaction?.find((item: any) => {
        return item.transactionType === TransactionType["EXPENSE"];
      })?.totalAmount || 0;

    const income = summaryTransaction.find(
      (item: any) => item?.transactionType === TransactionType["INCOME"]
    );

    const expense = summaryTransaction.find(
      (item: any) => item?.transactionType === TransactionType["EXPENSE"]
    );

    reply.code(200).send({
      message: "Get transaction successfully.",
      income,
      expense,
      total: totalIncome - totalExpense,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new BadRequestError(error.message);
    }
  }
};

export const getSummary = async (
  request: FastifyRequest<{ Querystring: GetSummaryPeriodBody }>,
  reply: FastifyReply
) => {
  try {
    const { end, start } = request.query;
    const accountId = request.accountId;
    const startDate = new Date(start).setHours(0, 0, 0, 0);
    const endDate = new Date(end).setHours(23, 59, 59, 999);
    const repository = appDataSource.getMongoRepository(Transaction);
    let filter = {};

    if (start && end) {
      filter = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (start || end) {
      const currentDate = start ?? end;
      const endCurrentDate = new Date(currentDate).setHours(23, 59, 59, 999);
      filter = {
        $gte: new Date(currentDate),
        $lte: new Date(endCurrentDate),
      };
    }

    console.log(filter);

    // Aggregate by transaction type
    const summaryTransaction = (await repository
      .aggregate([
        {
          $match: {
            accountId,
            createdAt: filter,
          },
        },
        {
          $group: {
            _id: {
              transactionType: "$transactionType",
            },
            totalAmount: { $sum: "$amount" },
            transactionCount: { $sum: 1 },
            averageAmount: { $avg: "$amount" },
          },
        },
        {
          $project: {
            _id: 0,
            transactionType: "$_id.transactionType",
            totalAmount: 1,
            transactionCount: 1,
            averageAmount: 1,
          },
        },
      ])
      .toArray()) as any;

    const totalIncome =
      summaryTransaction?.find((item: any) => {
        return item.transactionType === TransactionType["INCOME"];
      })?.totalAmount || 0;

    const totalExpense =
      summaryTransaction?.find((item: any) => {
        return item.transactionType === TransactionType["EXPENSE"];
      })?.totalAmount || 0;

    const income = summaryTransaction.find(
      (item: any) => item?.transactionType === TransactionType["INCOME"]
    );

    const expense = summaryTransaction.find(
      (item: any) => item?.transactionType === TransactionType["EXPENSE"]
    );

    reply.code(200).send({
      message: "Get transaction successfully.",
      income,
      expense,
      total: totalIncome - totalExpense,
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new BadRequestError(error.message);
    }
  }
};
