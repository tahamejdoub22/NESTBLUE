import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  async create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    try {
      if (!req.user || !req.user.userId) {
        throw new Error('User not authenticated or userId missing');
      }
      const task = await this.tasksService.create(createTaskDto, req.user.userId);
      return this.transformTask(task);
    } catch (error) {
      console.error('Error in tasks.create:', error);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  async findAll(@Request() req) {
    try {
      // Safely extract projectId from query params - handle undefined/null/empty string
      const projectId = req.query?.projectId as string | undefined;
      const validProjectId = projectId && projectId.trim() !== '' ? projectId.trim() : undefined;
      const tasks = await this.tasksService.findAll(validProjectId);
      // Transform tasks to match frontend format
      return tasks.map((task) => this.transformTask(task));
    } catch (error) {
      console.error(`Error in tasks.findAll:`, error);
      throw error;
    }
  }

  @Get(':uid')
  @ApiOperation({ summary: 'Get task by UID' })
  async findOne(@Param('uid') uid: string) {
    const task = await this.tasksService.findOne(uid);
    return this.transformTask(task);
  }

  private transformTask(task: any) {
    return {
      uid: task.uid,
      identifier: task.identifier,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      projectId: task.projectId, // Include projectId for frontend filtering
      assigneeIds: task.assigneeIds || [], // Include assigneeIds for frontend
      assignees: task.assigneeIds || [], // Keep assignees for backward compatibility
      dueDate: task.dueDate,
      startDate: task.startDate,
      subtasks: task.subtasks?.map((s: any) => ({
        id: s.id,
        title: s.title,
        completed: s.completed,
      })) || [],
      comments: task.comments?.map((c: any) => ({
        id: c.id,
        text: c.text,
        author: c.author?.name || 'Unknown',
        createdAt: c.createdAt,
      })) || [],
      attachments: task.attachments?.map((a: any) => ({
        id: a.id,
        name: a.name,
        url: a.url,
        size: a.size,
        type: a.type,
      })) || [],
      estimatedCost: task.estimatedCost,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }

  @Patch(':uid')
  @ApiOperation({ summary: 'Update task' })
  async update(@Param('uid') uid: string, @Body() updateTaskDto: UpdateTaskDto) {
    const task = await this.tasksService.update(uid, updateTaskDto);
    return this.transformTask(task);
  }

  @Delete(':uid')
  @ApiOperation({ summary: 'Delete task' })
  remove(@Param('uid') uid: string) {
    return this.tasksService.remove(uid);
  }

  // Subtasks
  @Post(':uid/subtasks')
  @ApiOperation({ summary: 'Add subtask to task' })
  async addSubtask(@Param('uid') uid: string, @Body() createSubtaskDto: CreateSubtaskDto) {
    const subtask = await this.tasksService.addSubtask(uid, createSubtaskDto);
    return {
      id: subtask.id,
      title: subtask.title,
      completed: subtask.completed,
    };
  }

  @Patch(':uid/subtasks/:subtaskId')
  @ApiOperation({ summary: 'Update subtask' })
  async updateSubtask(
    @Param('uid') uid: string,
    @Param('subtaskId') subtaskId: string,
    @Body() updateData: Partial<CreateSubtaskDto & { completed: boolean }>,
  ) {
    const subtask = await this.tasksService.updateSubtask(uid, subtaskId, updateData);
    return {
      id: subtask.id,
      title: subtask.title,
      completed: subtask.completed,
    };
  }

  @Delete(':uid/subtasks/:subtaskId')
  @ApiOperation({ summary: 'Delete subtask' })
  deleteSubtask(@Param('uid') uid: string, @Param('subtaskId') subtaskId: string) {
    return this.tasksService.deleteSubtask(uid, subtaskId);
  }

  // Comments
  @Post(':uid/comments')
  @ApiOperation({ summary: 'Add comment to task' })
  async addComment(
    @Param('uid') uid: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req,
  ) {
    const comment = await this.tasksService.addComment(uid, createCommentDto, req.user.userId);
    return {
      id: comment.id,
      text: comment.text,
      author: comment.author?.name || 'Unknown',
      createdAt: comment.createdAt,
    };
  }

  @Patch(':uid/comments/:commentId')
  @ApiOperation({ summary: 'Update comment' })
  async updateComment(
    @Param('uid') uid: string,
    @Param('commentId') commentId: string,
    @Body() updateData: { text: string },
  ) {
    const comment = await this.tasksService.updateComment(uid, commentId, updateData);
    return {
      id: comment.id,
      text: comment.text,
      author: comment.author?.name || 'Unknown',
      createdAt: comment.createdAt,
    };
  }

  @Delete(':uid/comments/:commentId')
  @ApiOperation({ summary: 'Delete comment' })
  deleteComment(@Param('uid') uid: string, @Param('commentId') commentId: string) {
    return this.tasksService.deleteComment(uid, commentId);
  }

  // Attachments
  @Post(':uid/attachments')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiOperation({ summary: 'Upload attachment to task' })
  @ApiConsumes('multipart/form-data')
  async uploadAttachment(@Param('uid') uid: string, @UploadedFile() file: Express.Multer.File) {
    const attachment = await this.tasksService.uploadAttachment(uid, file);
    return {
      id: attachment.id,
      name: attachment.name,
      url: attachment.url,
      size: attachment.size,
      type: attachment.type,
    };
  }

  @Get(':uid/attachments/:attachmentId/download')
  @ApiOperation({ summary: 'Download attachment' })
  async downloadAttachment(
    @Param('uid') uid: string,
    @Param('attachmentId') attachmentId: string,
    @Res() res: Response,
  ) {
    const attachment = await this.tasksService.getAttachment(uid, attachmentId);
    
    // For now, return the URL or file path
    // In production, you'd want to stream the actual file
    res.setHeader('Content-Type', attachment.type);
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.name}"`);
    
    // If attachment.url is a file path, stream it
    // Otherwise, redirect to the URL
    if (attachment.url.startsWith('http')) {
      return res.redirect(attachment.url);
    } else {
      // For local files, you'd need to implement file streaming
      // This is a placeholder - adjust based on your file storage setup
      return res.json({ url: attachment.url, name: attachment.name });
    }
  }

  @Delete(':uid/attachments/:attachmentId')
  @ApiOperation({ summary: 'Delete attachment' })
  deleteAttachment(@Param('uid') uid: string, @Param('attachmentId') attachmentId: string) {
    return this.tasksService.deleteAttachment(uid, attachmentId);
  }
}

