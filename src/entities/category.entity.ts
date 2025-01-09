import { Column, Entity, ObjectId, ObjectIdColumn } from "typeorm";
import { MultiLang, TransactionType } from "../types";

@Entity()
export class Category {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  categoryName: MultiLang;

  @Column()
  transactionTyp: TransactionType;
}
