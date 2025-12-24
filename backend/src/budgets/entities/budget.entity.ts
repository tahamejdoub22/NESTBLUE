import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Project } from '../../projects/entities/project.entity';
import { CostCategory, Currency } from '../../costs/entities/cost.entity';

export enum BudgetPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

@Entity('budgets')
export class Budget extends BaseEntity {
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

  @Column({
    type: 'enum',
    enum: BudgetPeriod,
  })
  period: BudgetPeriod;

  @Column({ type: 'timestamptz' })
  startDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endDate: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  projectId: string;

  @ManyToOne(() => Project, { nullable: true })
  @JoinColumn({ name: 'projectId', referencedColumnName: 'uid' })
  project: Project;
}


