import { Entity, ObjectId, ObjectIdColumn, Column } from "typeorm";

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
  refreshToken: string;

  @Column()
  revoked: boolean;

  @Column()
  tokenExpiredAt: Date;

  @Column()
  refreshTokenExpiredAt: Date;
}
