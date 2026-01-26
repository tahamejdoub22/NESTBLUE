import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../common/entities/base.entity";
import { Project } from "../../projects/entities/project.entity";
import { Task } from "../../tasks/entities/task.entity";

export enum CostCategory {
  HOUSING = "housing",
  TRANSPORTATION = "transportation",
  FOOD = "food",
  UTILITIES = "utilities",
  HEALTHCARE = "healthcare",
  ENTERTAINMENT = "entertainment",
  SHOPPING = "shopping",
  EDUCATION = "education",
  SAVINGS = "savings",
  OTHER = "other",
}

export enum Currency {
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  MAD = "MAD",
}

@Entity("costs")
export class Cost extends BaseEntity {
  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: "enum",
    enum: Currency,
    default: Currency.USD,
  })
  currency: Currency;

  @Column({
    type: "enum",
    enum: CostCategory,
  })
  category: CostCategory;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "timestamptz" })
  date: Date;

  @Column({ type: "varchar", array: true, default: [] })
  tags: string[];

  @Column({ type: "varchar", length: 50, nullable: true })
  projectId: string;

  @ManyToOne(() => Project, { nullable: true })
  @JoinColumn({ name: "projectId", referencedColumnName: "uid" })
  project: Project;

  @Column({ type: "varchar", length: 50, nullable: true })
  taskId: string;

  @ManyToOne(() => Task, { nullable: true })
  @JoinColumn({ name: "taskId", referencedColumnName: "uid" })
  task: Task;
}
