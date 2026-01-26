import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TasksService } from "./tasks.service";
import { TasksController } from "./tasks.controller";
import { Task } from "./entities/task.entity";
import { Subtask } from "./entities/subtask.entity";
import { Comment } from "./entities/comment.entity";
import { Attachment } from "./entities/attachment.entity";
import { StorageModule } from "../storage/storage.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { SprintsModule } from "../sprints/sprints.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Subtask, Comment, Attachment]),
    StorageModule,
    NotificationsModule,
    forwardRef(() => SprintsModule),
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
