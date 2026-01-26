import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Task } from "./task.entity";

@Entity("subtasks")
export class Subtask {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255 })
  title: string;

  @Column({ type: "boolean", default: false })
  completed: boolean;

  @Column({ type: "varchar", length: 50 })
  taskUid: string;

  @ManyToOne(() => Task, (task) => task.subtasks, { onDelete: "CASCADE" })
  @JoinColumn({ name: "taskUid", referencedColumnName: "uid" })
  task: Task;

  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date;
}
