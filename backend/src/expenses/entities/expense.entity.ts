import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Project } from '../../projects/entities/project.entity';
import { CostCategory, Currency } from '../../costs/entities/cost.entity';

export enum ExpenseFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  ONE_TIME = 'one-time',
}

@Entity('expenses')
export class Expense extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: Currency,
    default: Currency.USD,
  })
  currency: Currency;

  @Column({
    type: 'enum',
    enum: CostCategory,
  })
  category: CostCategory;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ExpenseFrequency,
  })
  frequency: ExpenseFrequency;

  @Column({ type: 'timestamptz' })
  startDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endDate: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', array: true, default: [] })
  tags: string[];

  @Column({ type: 'varchar', length: 50, nullable: true })
  projectId: string;

  @ManyToOne(() => Project, { nullable: true })
  @JoinColumn({ name: 'projectId', referencedColumnName: 'uid' })
  project: Project;
}


