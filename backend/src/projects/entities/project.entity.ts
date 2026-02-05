import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Task } from "../../tasks/entities/task.entity";
import { Cost } from "../../costs/entities/cost.entity";
import { Expense } from "../../expenses/entities/expense.entity";
import { Budget } from "../../budgets/entities/budget.entity";
import { Contract } from "../../contracts/entities/contract.entity";
import { Sprint } from "../../sprints/entities/sprint.entity";
import { TeamSpace } from "./team-space.entity";
import { ProjectMember } from "./project-member.entity";

export enum ProjectStatus {
  ACTIVE = "active",
  ARCHIVED = "archived",
  ON_HOLD = "on-hold",
}

@Entity("projects")
@Index(["uid"], { unique: true })
export class Project {
  @Column({ type: "varchar", length: 50, primary: true })
  uid: string; // Unique identifier (not id!)

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({
    type: "enum",
    enum: ProjectStatus,
    default: ProjectStatus.ACTIVE,
  })
  status: ProjectStatus;

  @Column({ type: "int", default: 0 })
  progress: number; // 0-100

  @Column({ type: "timestamptz", nullable: true })
  startDate: Date;

  @Column({ type: "timestamptz", nullable: true })
  endDate: Date;

  @Column({ type: "varchar", length: 50, nullable: true })
  color: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  icon: string;

  @Column({ type: "uuid", nullable: true })
  spaceId: string;

  @ManyToOne(() => TeamSpace, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "spaceId" })
  teamSpace: TeamSpace;

  @Column({ type: "uuid" })
  ownerId: string;

  @ManyToOne(() => User, (user) => user.ownedProjects)
  @JoinColumn({ name: "ownerId" })
  owner: User;

  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date;

  @OneToMany(() => Task, (task) => task.project)
  tasks: Task[];

  @OneToMany(() => Cost, (cost) => cost.project)
  costs: Cost[];

  @OneToMany(() => Expense, (expense) => expense.project)
  expenses: Expense[];

  @OneToMany(() => Budget, (budget) => budget.project)
  budgets: Budget[];

  @OneToMany(() => Contract, (contract) => contract.project)
  contracts: Contract[];

  @OneToMany(() => Sprint, (sprint) => sprint.project)
  sprints: Sprint[];

  @OneToMany(() => ProjectMember, (member) => member.project)
  members: ProjectMember[];
}
