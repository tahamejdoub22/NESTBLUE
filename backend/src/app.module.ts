import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { CostsModule } from './costs/costs.module';
import { ExpensesModule } from './expenses/expenses.module';
import { BudgetsModule } from './budgets/budgets.module';
import { ContractsModule } from './contracts/contracts.module';
import { SprintsModule } from './sprints/sprints.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MessagesModule } from './messages/messages.module';
import { NotificationsModule } from './notifications/notifications.module';
import { HealthModule } from './health/health.module';
import { StorageModule } from './storage/storage.module';
import { NotesModule } from './notes/notes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        try {
          const config = getDatabaseConfig(configService);
          console.log('🔧 TypeORM config created, initializing connection...');
          // Log connection info from the parsed URL instead of accessing config properties
          const databaseUrl = configService.get<string>('DATABASE_URL');
          if (databaseUrl) {
            try {
              const url = new URL(databaseUrl);
              console.log(`🔧 Connecting to database: ${url.hostname}:${url.port || 5432}/${url.pathname.slice(1)}`);
            } catch {
              console.log('🔧 Connecting to database...');
            }
          }
          return config;
        } catch (error) {
          console.error('❌ Error creating database config:', error);
          throw error;
        }
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ProjectsModule,
    TasksModule,
    CostsModule,
    ExpensesModule,
    BudgetsModule,
    ContractsModule,
    SprintsModule,
    DashboardModule,
    MessagesModule,
    NotificationsModule,
    HealthModule,
    StorageModule,
    NotesModule,
  ],
})
export class AppModule {}

