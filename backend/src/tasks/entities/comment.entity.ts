import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Task } from "./task.entity";
import { User } from "../../users/entities/user.entity";

@Entity("comments")
export class Comment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  text: string;

  @Column({ type: "uuid" })
  authorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "authorId" })
  author: User;

  @Column({ type: "varchar", length: 50 })
  taskUid: string;

  @ManyToOne(() => Task, (task) => task.comments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "taskUid", referencedColumnName: "uid" })
  task: Task;

  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date;
}
