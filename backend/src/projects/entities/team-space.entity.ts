import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { Project } from "./project.entity";
import { User } from "../../users/entities/user.entity";

@Entity("team_spaces")
export class TeamSpace {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @OneToMany(() => Project, (project) => project.teamSpace)
  projects: Project[];

  @Column({ type: "uuid" })
  createdById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "createdById" })
  createdBy: User;

  @Column({ type: "uuid", array: true, default: [] })
  memberIds: string[];

  @Column({ type: "varchar", length: 50, nullable: true })
  color: string;

  @Column({ type: "varchar", length: 50, nullable: true })
  icon: string;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
