import { Entity, ObjectIdColumn, ObjectId, Column } from "typeorm";
import { MultiLang, TransactionType } from "../types";

@Entity()
export class Transaction {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  userId: string;

  @Column()
  categoryId: string;

  @Column()
  transactionSlipId: string;

  @Column()
  amount: number;

  @Column()
  balance: number;

  @Column()
  description: MultiLang;

  @Column()
  note: MultiLang;

  @Column()
  transactionTyp: TransactionType;
}
