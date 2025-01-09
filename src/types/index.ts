export enum TransactionType {
  INCOME = "income",
  EXPENSE = "expense",
}

export enum TokenType {
  TOKEN = "token",
  REFRESH_TOKEN = "refreshToken",
}

export interface MultiLang {
  [key: string]: string;
}

export type Envs = {
  PORT: string;
  MONGODB_HOST: string;
  MONGODB_PORT: string;
  MONGODB_DATABASE: string;
  SECRET_MESSAGE: string;
};
