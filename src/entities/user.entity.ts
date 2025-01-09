import { Entity, ObjectId, ObjectIdColumn, Column } from "typeorm";

class Balance {
  @Column()
  balance: number;
}

@Entity()
export class User {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  email: string;

  @Column()
  phoneNumber: string;

  @Column(() => Balance)
  balance: Balance;
}
