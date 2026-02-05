import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Task } from "./task.entity";

@Entity("attachments")
export class Attachment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 500 })
  url: string;

  @Column({ type: "bigint" })
  size: number;

  @Column({ type: "varchar", length: 100 })
  type: string;

  @Column({ type: "varchar", length: 50 })
  taskUid: string;

  @ManyToOne(() => Task, (task) => task.attachments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "taskUid", referencedColumnName: "uid" })
  task: Task;

  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date;
}
