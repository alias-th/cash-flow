import { Entity, ObjectId, ObjectIdColumn, Column } from "typeorm";

@Entity()
export class Token {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  userId: string;

  @Column()
  deviceId: string;

  @Column()
  token: string;

  @Column()
  tokenType: string;

  @Column()
  expiresAt: Date;
}
