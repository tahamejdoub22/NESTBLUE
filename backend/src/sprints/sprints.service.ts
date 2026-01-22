import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sprint, SprintStatus } from './entities/sprint.entity';
import { Task, TaskStatus } from '../tasks/entities/task.entity';
import { CreateSprintDto } from './dto/create-sprint.dto';
import { UpdateSprintDto } from './dto/update-sprint.dto';

@Injectable()
export class SprintsService {
  constructor(
    @InjectRepository(Sprint)
    private sprintsRepository: Repository<Sprint>,
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async create(createSprintDto: CreateSprintDto): Promise<Sprint> {
    const sprint = this.sprintsRepository.create(createSprintDto);
    const savedSprint = await this.sprintsRepository.save(sprint);
    
    // Auto-update status based on dates
    await this.updateSprintStatus(savedSprint.id);
    
    return savedSprint;
  }

  async findAll(projectId?: string): Promise<Sprint[]> {
    const queryBuilder = this.sprintsRepository.createQueryBuilder('sprint')
      .leftJoinAndSelect('sprint.project', 'project')
      .loadRelationCountAndMap('sprint.taskCount', 'sprint.tasks', 'tasks')
      .loadRelationCountAndMap(
        'sprint.completedTaskCount',
        'sprint.tasks',
        'tasks',
        (qb) => qb.where('(tasks.status = :lower OR tasks.status = :upper)', {
          lower: 'complete',
          upper: 'COMPLETE',
        })
      )
      .orderBy('sprint.startDate', 'DESC');

    if (projectId) {
      queryBuilder.where('sprint.projectId = :projectId', { projectId });
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Sprint> {
    const sprint = await this.sprintsRepository.findOne({
      where: { id },
      relations: ['project'],
    });

    if (!sprint) {
      throw new NotFoundException(`Sprint with ID ${id} not found`);
    }

    return sprint;
  }

  async update(id: string, updateSprintDto: UpdateSprintDto): Promise<Sprint> {
    const sprint = await this.findOne(id);
    Object.assign(sprint, updateSprintDto);
    const updatedSprint = await this.sprintsRepository.save(sprint);
    
    // Auto-update status based on dates
    await this.updateSprintStatus(id);
    
    // Recalculate task counts if dates changed
    if (updateSprintDto.startDate || updateSprintDto.endDate) {
      await this.recalculateTaskCounts(id);
    }
    
    return updatedSprint;
  }

  async remove(id: string): Promise<void> {
    const sprint = await this.findOne(id);
    await this.sprintsRepository.remove(sprint);
  }

  async getSprintTasks(sprintId: string): Promise<any[]> {
    try {
      const sprint = await this.findOne(sprintId);
      if (!sprint) {
        return [];
      }

      // Get tasks with subtasks, comments, and attachments counts
      const tasks = await this.tasksRepository.createQueryBuilder('task')
        .leftJoinAndSelect('task.subtasks', 'subtask')
        .leftJoinAndSelect('task.comments', 'comment')
        .leftJoinAndSelect('task.attachments', 'attachment')
        .where('task.sprintId = :sprintId', { sprintId })
        .orderBy('task.createdAt', 'DESC')
        .getMany();

      // Transform to match frontend format with real counts/data
      return tasks.map((task) => ({
        uid: task.uid,
        identifier: task.identifier,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        projectId: task.projectId,
        sprintId: task.sprintId,
        assigneeIds: task.assigneeIds || [],
        assignees: task.assigneeIds || [],
        dueDate: task.dueDate,
        startDate: task.startDate,
        subtasks: task.subtasks || [],
        comments: task.comments || [],
        attachments: task.attachments?.length || 0,
        estimatedCost: task.estimatedCost,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      }));
    } catch (error) {
      console.error(`Error in SprintsService.getSprintTasks for sprintId ${sprintId}:`, error);
      throw error;
    }
  }

  /**
   * Update sprint status based on current date and sprint dates
   */
  private async updateSprintStatus(sprintId: string): Promise<void> {
    const sprint = await this.findOne(sprintId);
    if (!sprint) return;

    const now = new Date();
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);

    let newStatus = sprint.status;

    if (now < startDate) {
      newStatus = SprintStatus.PLANNED;
    } else if (now >= startDate && now <= endDate) {
      newStatus = SprintStatus.ACTIVE;
    } else if (now > endDate) {
      newStatus = SprintStatus.COMPLETED;
    }

    if (newStatus !== sprint.status) {
      await this.sprintsRepository.update(sprintId, { status: newStatus });
    }
  }

  /**
   * Recalculate task counts for a sprint
   */
  async recalculateTaskCounts(sprintId: string): Promise<void> {
    try {
      const taskCount = await this.tasksRepository.count({
        where: { sprintId },
      });

      // Using createQueryBuilder for completed tasks to handle inconsistent casing if needed
      // or just standard TypeORM with proper enum if data was clean.
      // Based on previous code: task.status === 'complete' || (task.status as string) === 'COMPLETE'
      // It implies data might be mixed.
      const completedTaskCount = await this.tasksRepository
        .createQueryBuilder('task')
        .where('task.sprintId = :sprintId', { sprintId })
        .andWhere('(task.status = :lower OR task.status = :upper)', {
          lower: 'complete',
          upper: 'COMPLETE',
        })
        .getCount();

      await this.sprintsRepository.update(sprintId, {
        taskCount: Number(total),
        completedTaskCount: Number(completed),
      });
    } catch (error) {
      console.error(
        `Error recalculating task counts for sprint ${sprintId}:`,
        error,
      );
      // Don't throw error to prevent blocking other operations
    }
  }

  /**
   * Update task counts when a task is added, removed, or status changes
   * This should be called from the tasks service
   */
  async updateTaskCountsForSprint(sprintId: string | null): Promise<void> {
    if (!sprintId) return;
    await this.recalculateTaskCounts(sprintId);
  }
}

