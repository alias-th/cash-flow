import { Entity, ObjectId, ObjectIdColumn, Column } from "typeorm";
import { TokenType } from "../types";

@Entity()
export class Token {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  accountId: string;

  @Column()
  deviceId: string;

  @Column()
  token: string;

  @Column()
  tokenType: TokenType;

  @Column()
  revoked: boolean;

  @Column()
  expiresAt: Date;
}
