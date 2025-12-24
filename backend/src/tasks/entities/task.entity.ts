import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { User } from '../../users/entities/user.entity';
import { Cost } from '../../costs/entities/cost.entity';
import { Subtask } from './subtask.entity';
import { Comment } from './comment.entity';
import { Attachment } from './attachment.entity';
import { Sprint } from '../../sprints/entities/sprint.entity';

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  COMPLETE = 'complete',
  BACKLOG = 'backlog',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('tasks')
@Index(['uid'], { unique: true })
@Index(['identifier'], { unique: true })
export class Task {
  @Column({ type: 'varchar', length: 50, primary: true })
  uid: string; // Backend ID (not id!)

  @Column({ type: 'varchar', length: 50, unique: true })
  identifier: string; // Display ID (e.g., "WEB-001")

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @Column({ type: 'varchar', length: 50, nullable: true })
  projectId: string;

  @ManyToOne(() => Project, (project) => project.tasks, { nullable: true })
  @JoinColumn({ name: 'projectId', referencedColumnName: 'uid' })
  project: Project;

  @Column({ type: 'uuid', nullable: true })
  sprintId: string;

  @ManyToOne(() => Sprint, { nullable: true })
  @JoinColumn({ name: 'sprintId', referencedColumnName: 'id' })
  sprint: Sprint;

  @Column({ type: 'uuid' })
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ type: 'timestamptz', nullable: true })
  dueDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  startDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  estimatedCost: {
    amount: number;
    currency: 'USD' | 'EUR' | 'GBP' | 'MAD';
  };

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => Subtask, (subtask) => subtask.task, { cascade: true })
  subtasks: Subtask[];

  @OneToMany(() => Comment, (comment) => comment.task, { cascade: true })
  comments: Comment[];

  @OneToMany(() => Attachment, (attachment) => attachment.task, {
    cascade: true,
  })
  attachments: Attachment[];

  @OneToMany(() => Cost, (cost) => cost.task)
  costs: Cost[];

  // Many-to-many relationship with users (assignees)
  @Column({ type: 'uuid', array: true, default: [] })
  assigneeIds: string[];
}


