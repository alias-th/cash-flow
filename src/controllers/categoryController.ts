import { FastifyReply, FastifyRequest } from "fastify";
import { MultiLang, TransactionType } from "../types";
import { Category } from "../entities/category.entity";
import { appDataSource } from "../app-data-source";
import { BadRequestError } from "../errors/BadRequestError";
import { ObjectId } from "mongodb";

interface AddCategory {
  categoryName: MultiLang;
  transactionType: TransactionType;
}

interface RemoveCategory {
  categoryId: string;
}

export const addCategory = async (
  request: FastifyRequest<{ Body: AddCategory }>,
  reply: FastifyReply
) => {
  try {
    const { categoryName, transactionType } = request.body;

    const newCategory = new Category();
    newCategory.categoryName = categoryName;
    newCategory.transactionType = transactionType;

    await appDataSource.manager.save(newCategory);

    reply.code(200).send({
      message: "Category is created successfully ",
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new BadRequestError(error.message);
    }
  }
};

export const removeCategory = async (
  request: FastifyRequest<{ Params: RemoveCategory }>,
  reply: FastifyReply
) => {
  try {
    const { categoryId } = request.params;
    const id = new ObjectId(categoryId);

    // Check existing category
    const existingCategory = await appDataSource
      .getMongoRepository(Category)
      .findOne({ where: { _id: id } });
    if (!existingCategory) {
      throw new BadRequestError("Category not found.");
    }

    // Remove category
    await appDataSource.manager.remove(existingCategory);

    reply.code(200).send({ message: "Category is removed successfully." });
  } catch (error) {
    if (error instanceof Error) {
      throw new BadRequestError(error.message);
    }
  }
};

export const getAllCategories = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const allCategories = await appDataSource.manager.find(Category, {});

    reply
      .code(200)
      .send({
        message: "Get all categories successfully.",
        categories: allCategories,
      });
  } catch (error) {
    if (error instanceof Error) {
      throw new BadRequestError(error.message);
    }
  }
};
