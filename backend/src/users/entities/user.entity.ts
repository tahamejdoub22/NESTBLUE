import { Entity, Column, OneToMany, BeforeInsert, BeforeUpdate } from "typeorm";
import { Exclude } from "class-transformer";
import { BaseEntity } from "../../common/entities/base.entity";
import { Project } from "../../projects/entities/project.entity";
import { Task } from "../../tasks/entities/task.entity";
import * as bcrypt from "bcrypt";

export enum UserStatus {
  ONLINE = "online",
  OFFLINE = "offline",
  AWAY = "away",
  BUSY = "busy",
}

@Entity("users")
export class User extends BaseEntity {
  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  avatar: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  role: string;

  @Column({
    type: "enum",
    enum: UserStatus,
    default: UserStatus.OFFLINE,
  })
  status: UserStatus;

  @Column({ type: "varchar", length: 255, nullable: true })
  phone: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  department: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  position: string;

  @Column({ type: "varchar", length: 255 })
  @Exclude()
  password: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  @Exclude()
  refreshToken: string;

  @Column({ type: "boolean", default: false })
  emailVerified: boolean;

  @Column({ type: "varchar", length: 255, nullable: true })
  @Exclude()
  emailVerificationToken: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  @Exclude()
  passwordResetToken: string;

  @Column({ type: "timestamptz", nullable: true })
  @Exclude()
  passwordResetExpires: Date;

  @Column({ type: "jsonb", nullable: true })
  preferences: {
    theme?: "light" | "dark" | "system";
    language?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
  };

  @Column({ type: "jsonb", nullable: true })
  settings: {
    timezone?: string;
    dateFormat?: string;
    currency?: string;
  };

  @OneToMany(() => Project, (project) => project.owner)
  ownedProjects: Project[];

  @OneToMany(() => Task, (task) => task.createdBy)
  createdTasks: Task[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith("$2b$")) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
