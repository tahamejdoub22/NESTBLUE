import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "../../common/entities/base.entity";
import { Project } from "../../projects/entities/project.entity";
import { Task } from "../../tasks/entities/task.entity";

export enum SprintStatus {
  PLANNED = "planned",
  ACTIVE = "active",
  COMPLETED = "completed",
}

@Entity("sprints")
export class Sprint extends BaseEntity {
  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 50 })
  projectId: string;

  @ManyToOne(() => Project, (project) => project.sprints)
  @JoinColumn({ name: "projectId", referencedColumnName: "uid" })
  project: Project;

  @Column({ type: "timestamptz" })
  startDate: Date;

  @Column({ type: "timestamptz" })
  endDate: Date;

  @Column({
    type: "enum",
    enum: SprintStatus,
    default: SprintStatus.PLANNED,
  })
  status: SprintStatus;

  @Column({ type: "text", nullable: true })
  goal: string;

  @Column({ type: "int", default: 0 })
  taskCount: number;

  @Column({ type: "int", default: 0 })
  completedTaskCount: number;

  @OneToMany(() => Task, (task) => task.sprint)
  tasks: Task[];
}
