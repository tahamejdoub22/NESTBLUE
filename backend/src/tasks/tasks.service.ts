import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Task } from "./entities/task.entity";
import { Subtask } from "./entities/subtask.entity";
import { Comment } from "./entities/comment.entity";
import { Attachment } from "./entities/attachment.entity";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { CreateSubtaskDto } from "./dto/create-subtask.dto";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { v4 as uuidv4 } from "uuid";
import { StorageService } from "../storage/storage.service";
import { NotificationsService } from "../notifications/notifications.service";
import { NotificationType } from "../notifications/entities/notification.entity";
import { SprintsService } from "../sprints/sprints.service";

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(Subtask)
    private subtasksRepository: Repository<Subtask>,
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Attachment)
    private attachmentsRepository: Repository<Attachment>,
    private readonly storageService: StorageService,
    private readonly notificationsService: NotificationsService,
    @Inject(forwardRef(() => SprintsService))
    private readonly sprintsService: SprintsService,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    try {
      if (!userId) {
        throw new Error("UserId is required");
      }

      const taskData: any = {
        ...createTaskDto,
        uid: this.generateUid(),
        identifier: this.generateIdentifier(),
        createdById: userId,
        assigneeIds: createTaskDto.assigneeIds || [],
      };

      // Handle estimatedCost type conversion
      if (createTaskDto.estimatedCost) {
        taskData.estimatedCost = {
          amount: createTaskDto.estimatedCost.amount,
          currency: createTaskDto.estimatedCost.currency as
            | "USD"
            | "EUR"
            | "GBP"
            | "MAD",
        };
      }

      const task = this.tasksRepository.create(taskData);
      const savedTask = await this.tasksRepository.save(task);
      const finalTask = Array.isArray(savedTask) ? savedTask[0] : savedTask;

      // Update sprint task counts if task is assigned to a sprint
      if (finalTask.sprintId) {
        try {
          await this.sprintsService.updateTaskCountsForSprint(
            finalTask.sprintId,
          );
        } catch (sprintError) {
          console.error("Error updating sprint task counts:", sprintError);
          // Don't fail task creation if sprint update fails
        }
      }

      // Notify assignees about new task
      if (createTaskDto.assigneeIds && createTaskDto.assigneeIds.length > 0) {
        try {
          const assigneeIds = createTaskDto.assigneeIds.filter(
            (id) => id !== userId,
          );
          if (assigneeIds.length > 0) {
            await this.notificationsService.notifyUsers(
              assigneeIds,
              "New Task Assigned",
              `You have been assigned to task: ${finalTask.title}`,
              NotificationType.INFO,
              {
                actionUrl: `/tasks/${finalTask.uid}`,
                actionLabel: "View Task",
                icon: "task",
                projectId: finalTask.projectId,
                taskId: finalTask.uid,
              },
            );
          }
        } catch (notificationError) {
          console.error("Error sending notifications:", notificationError);
          // Don't fail task creation if notification fails
        }
      }

      return finalTask;
    } catch (error) {
      console.error("Error in TasksService.create:", error);
      throw error;
    }
  }

  async findAll(projectId?: string): Promise<Task[]> {
    try {
      const where = projectId ? { projectId } : {};
      return await this.tasksRepository.find({
        where,
        relations: [], // Simplified - don't load relations to avoid circular dependencies
        order: { createdAt: "DESC" },
      });
    } catch (error) {
      console.error(
        `Error in TasksService.findAll for projectId ${projectId}:`,
        error,
      );
      throw error;
    }
  }

  async findOne(uid: string): Promise<Task> {
    try {
      const task = await this.tasksRepository.findOne({
        where: { uid },
        relations: [], // Simplified - don't load relations to avoid circular dependencies
      });

      if (!task) {
        throw new NotFoundException(`Task with UID ${uid} not found`);
      }

      return task;
    } catch (error) {
      console.error(`Error in TasksService.findOne for UID ${uid}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }

  async update(uid: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(uid);
    const oldStatus = task.status;
    const oldAssigneeIds = [...(task.assigneeIds || [])];
    const oldSprintId = task.sprintId;

    Object.assign(task, updateTaskDto);
    const updatedTask = await this.tasksRepository.save(task);

    // Update sprint task counts if sprint changed or status changed
    const sprintIdsToUpdate = new Set<string>();
    if (task.sprintId) {
      sprintIdsToUpdate.add(task.sprintId);
    }
    if (oldSprintId && oldSprintId !== task.sprintId) {
      sprintIdsToUpdate.add(oldSprintId);
    }

    // Update counts for affected sprints
    for (const sprintId of sprintIdsToUpdate) {
      await this.sprintsService.updateTaskCountsForSprint(sprintId);
    }

    // Notify assignees about status change
    if (
      updateTaskDto.status &&
      updateTaskDto.status !== oldStatus &&
      task.assigneeIds
    ) {
      await this.notificationsService.notifyUsers(
        task.assigneeIds,
        "Task Status Updated",
        `Task "${task.title}" status changed from ${oldStatus} to ${updateTaskDto.status}`,
        NotificationType.INFO,
        {
          actionUrl: `/tasks/${task.uid}`,
          actionLabel: "View Task",
          icon: "task",
          projectId: task.projectId,
          taskId: task.uid,
        },
      );
    }

    // Notify new assignees
    if (updateTaskDto.assigneeIds) {
      const newAssignees = updateTaskDto.assigneeIds.filter(
        (id) => !oldAssigneeIds.includes(id),
      );
      if (newAssignees.length > 0) {
        await this.notificationsService.notifyUsers(
          newAssignees,
          "Task Assigned",
          `You have been assigned to task: ${task.title}`,
          NotificationType.INFO,
          {
            actionUrl: `/tasks/${task.uid}`,
            actionLabel: "View Task",
            icon: "task",
            projectId: task.projectId,
            taskId: task.uid,
          },
        );
      }
    }

    return updatedTask;
  }

  async remove(uid: string): Promise<void> {
    const task = await this.findOne(uid);
    const sprintId = task.sprintId;
    await this.tasksRepository.remove(task);

    // Update sprint task counts if task was assigned to a sprint
    if (sprintId) {
      await this.sprintsService.updateTaskCountsForSprint(sprintId);
    }
  }

  // Subtasks
  async addSubtask(
    uid: string,
    createSubtaskDto: CreateSubtaskDto,
  ): Promise<Subtask> {
    const task = await this.findOne(uid);
    const subtask = this.subtasksRepository.create({
      ...createSubtaskDto,
      taskUid: task.uid,
    });
    return this.subtasksRepository.save(subtask);
  }

  async updateSubtask(
    uid: string,
    subtaskId: string,
    updateData: Partial<CreateSubtaskDto & { completed: boolean }>,
  ): Promise<Subtask> {
    const subtask = await this.subtasksRepository.findOne({
      where: { id: subtaskId, taskUid: uid },
    });

    if (!subtask) {
      throw new NotFoundException("Subtask not found");
    }

    Object.assign(subtask, updateData);
    return this.subtasksRepository.save(subtask);
  }

  async deleteSubtask(uid: string, subtaskId: string): Promise<void> {
    const subtask = await this.subtasksRepository.findOne({
      where: { id: subtaskId, taskUid: uid },
    });

    if (!subtask) {
      throw new NotFoundException("Subtask not found");
    }

    await this.subtasksRepository.remove(subtask);
  }

  // Comments
  async addComment(
    uid: string,
    createCommentDto: CreateCommentDto,
    userId: string,
  ): Promise<Comment> {
    const task = await this.findOne(uid);
    const comment = this.commentsRepository.create({
      ...createCommentDto,
      taskUid: task.uid,
      authorId: userId,
    });
    const savedComment = await this.commentsRepository.save(comment);
    // Reload with author relation
    const finalComment =
      (await this.commentsRepository.findOne({
        where: { id: savedComment.id },
        relations: ["author"],
      })) || savedComment;

    // Notify task assignees and creator about new comment (except the comment author)
    const notifyUserIds = [
      ...(task.assigneeIds || []),
      task.createdById,
    ].filter((id) => id && id !== userId);

    if (notifyUserIds.length > 0) {
      const uniqueUserIds = [...new Set(notifyUserIds)];
      await this.notificationsService.notifyUsers(
        uniqueUserIds,
        "New Comment on Task",
        `A new comment was added to task: ${task.title}`,
        NotificationType.INFO,
        {
          actionUrl: `/tasks/${task.uid}`,
          actionLabel: "View Task",
          icon: "comment",
          projectId: task.projectId,
          taskId: task.uid,
        },
      );
    }

    return finalComment;
  }

  async updateComment(
    uid: string,
    commentId: string,
    updateData: { text: string },
  ): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId, taskUid: uid },
      relations: ["author"],
    });

    if (!comment) {
      throw new NotFoundException("Comment not found");
    }

    comment.text = updateData.text;
    const savedComment = await this.commentsRepository.save(comment);
    // Reload with author relation
    return (
      this.commentsRepository.findOne({
        where: { id: savedComment.id },
        relations: ["author"],
      }) || savedComment
    );
  }

  async deleteComment(uid: string, commentId: string): Promise<void> {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId, taskUid: uid },
    });

    if (!comment) {
      throw new NotFoundException("Comment not found");
    }

    await this.commentsRepository.remove(comment);
  }

  // Attachments
  async uploadAttachment(
    uid: string,
    file: Express.Multer.File,
  ): Promise<Attachment> {
    const task = await this.findOne(uid);

    // Upload to Supabase Storage via S3 protocol
    const { url } = await this.storageService.uploadFile(
      file,
      `tasks/${task.uid}`,
    );

    const attachment = this.attachmentsRepository.create({
      name: file.originalname,
      url, // Supabase public URL
      size: file.size,
      type: file.mimetype,
      taskUid: task.uid,
    });
    return this.attachmentsRepository.save(attachment);
  }

  async deleteAttachment(uid: string, attachmentId: string): Promise<void> {
    const attachment = await this.attachmentsRepository.findOne({
      where: { id: attachmentId, taskUid: uid },
    });

    if (!attachment) {
      throw new NotFoundException("Attachment not found");
    }

    await this.attachmentsRepository.remove(attachment);
  }

  async getAttachment(uid: string, attachmentId: string): Promise<Attachment> {
    const attachment = await this.attachmentsRepository.findOne({
      where: { id: attachmentId, taskUid: uid },
    });

    if (!attachment) {
      throw new NotFoundException("Attachment not found");
    }

    return attachment;
  }

  private generateUid(): string {
    return uuidv4().replace(/-/g, "").substring(0, 12);
  }

  private generateIdentifier(): string {
    const prefix = "TASK";
    const random = uuidv4().replace(/-/g, "").substring(0, 6).toUpperCase();
    return `${prefix}-${random}`;
  }
}
