import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

@Entity('notifications')
export class Notification extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.INFO,
  })
  type: NotificationType;

  @Column({ type: 'boolean', default: false })
  read: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  actionUrl: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  actionLabel: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  icon: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 50, nullable: true })
  projectId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  taskId: string;
}

