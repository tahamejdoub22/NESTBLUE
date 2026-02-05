import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../common/entities/base.entity";
import { Project } from "../../projects/entities/project.entity";
import { CostCategory, Currency } from "../../costs/entities/cost.entity";

export enum ContractStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  EXPIRED = "expired",
  TERMINATED = "terminated",
  PENDING_RENEWAL = "pending-renewal",
  CANCELLED = "cancelled",
}

export enum PaymentFrequency {
  ONE_TIME = "one-time",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  SEMI_ANNUAL = "semi-annual",
  ANNUAL = "annual",
}

@Entity("contracts")
export class Contract extends BaseEntity {
  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 100, unique: true })
  contractNumber: string;

  @Column({ type: "varchar", length: 255 })
  vendor: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  vendorEmail: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  vendorPhone: string;

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
  startDate: Date;

  @Column({ type: "timestamptz", nullable: true })
  endDate: Date;

  @Column({ type: "timestamptz", nullable: true })
  renewalDate: Date;

  @Column({
    type: "enum",
    enum: ContractStatus,
    default: ContractStatus.DRAFT,
  })
  status: ContractStatus;

  @Column({
    type: "enum",
    enum: PaymentFrequency,
  })
  paymentFrequency: PaymentFrequency;

  @Column({ type: "boolean", default: false })
  autoRenew: boolean;

  @Column({ type: "varchar", array: true, default: [] })
  tags: string[];

  @Column({ type: "varchar", length: 50, nullable: true })
  projectId: string;

  @ManyToOne(() => Project, { nullable: true })
  @JoinColumn({ name: "projectId", referencedColumnName: "uid" })
  project: Project;

  @Column({ type: "varchar", array: true, default: [] })
  attachments: string[]; // File URLs or paths

  @Column({ type: "text", nullable: true })
  notes: string;
}
