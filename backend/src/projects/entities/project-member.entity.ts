import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Project } from './project.entity';
import { User } from '../../users/entities/user.entity';

export enum ProjectMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer',
}

@Entity('project_members')
@Index(['projectUid', 'userId'], { unique: true })
export class ProjectMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  projectUid: string;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectUid', referencedColumnName: 'uid' })
  project: Project;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: ProjectMemberRole,
    default: ProjectMemberRole.MEMBER,
  })
  role: ProjectMemberRole;

  @Column({ type: 'uuid', nullable: true })
  invitedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'invitedById' })
  invitedBy: User;

  @CreateDateColumn({ type: 'timestamptz' })
  joinedAt: Date;
}

