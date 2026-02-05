import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { User } from "../users/entities/user.entity";
import { Project } from "../projects/entities/project.entity";
import { Task } from "../tasks/entities/task.entity";
import { Cost } from "../costs/entities/cost.entity";
import { Expense } from "../expenses/entities/expense.entity";
import { Budget } from "../budgets/entities/budget.entity";
import { Contract } from "../contracts/entities/contract.entity";
import { Sprint } from "../sprints/entities/sprint.entity";
import { Conversation } from "../messages/entities/conversation.entity";
import { Message } from "../messages/entities/message.entity";
import { Notification } from "../notifications/entities/notification.entity";
import { Subtask } from "../tasks/entities/subtask.entity";
import { Comment } from "../tasks/entities/comment.entity";
import { Attachment } from "../tasks/entities/attachment.entity";
import { ProjectMember } from "../projects/entities/project-member.entity";
import { TeamSpace } from "../projects/entities/team-space.entity";
import { Note } from "../notes/entities/note.entity";

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const databaseUrl = configService.get<string>("DATABASE_URL");

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not defined in environment variables");
  }

  try {
    // Parse the database URL
    const url = new URL(databaseUrl);
    const username = url.username;
    const password = url.password;
    const host = url.hostname;
    const port = parseInt(url.port) || 5432;
    const database = url.pathname.slice(1); // Remove leading '/'
    const ssl = url.searchParams.get("sslmode") === "require";

    if (!host || !database) {
      throw new Error("Invalid DATABASE_URL: missing host or database name");
    }

    console.log(
      `🔧 Database config: ${host}:${port}/${database} (SSL: ${ssl})`,
    );

    return {
      type: "postgres",
      host,
      port,
      username,
      password,
      database,
      ssl: ssl ? { rejectUnauthorized: false } : false,
      retryAttempts: 3,
      retryDelay: 3000,
      autoLoadEntities: false, // Explicitly set to false since we're providing entities array
      extra: {
        max: 10, // Maximum number of connections
        connectionTimeoutMillis: 30000, // 30 second connection timeout for PostgreSQL
        idleTimeoutMillis: 30000,
        // PostgreSQL-specific connection options via pg library
        // Note: statement_timeout and query_timeout are set via connection string or after connection
      },
      entities: [
        User,
        Project,
        ProjectMember,
        TeamSpace,
        Task,
        Cost,
        Expense,
        Budget,
        Contract,
        Sprint,
        Conversation,
        Message,
        Notification,
        Subtask,
        Comment,
        Attachment,
        Note,
      ],
      synchronize: false, // Disabled to prevent timeout issues - use migrations instead
      logging: configService.get<string>("NODE_ENV") === "development",
      migrations: ["dist/migrations/*.js"],
      migrationsRun: false,
    };
  } catch (error) {
    console.error("❌ Error parsing DATABASE_URL:", error);
    if (error instanceof Error) {
      throw new Error(`Invalid DATABASE_URL format: ${error.message}`);
    }
    throw new Error("Invalid DATABASE_URL format");
  }
};
