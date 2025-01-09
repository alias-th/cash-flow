import { Entity, ObjectId, ObjectIdColumn, Column } from "typeorm";

@Entity()
export class Device {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  userId: string;

  @Column()
  deviceName: string;

  @Column()
  deviceType: string;

  @Column()
  os: string;

  @Column()
  browser: string;

  @Column()
  ipAddress: string;
}
