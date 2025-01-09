import { Entity, ObjectId, ObjectIdColumn, Column } from "typeorm";

class Balance {
  @Column()
  balance: number;
}

@Entity()
export class Account {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  phoneNumber: string;

  @Column(() => Balance)
  balance: Balance;
}
