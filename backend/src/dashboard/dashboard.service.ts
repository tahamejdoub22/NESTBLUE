import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, MoreThanOrEqual } from 'typeorm';
import { Project } from '../projects/entities/project.entity';
import { Task, TaskStatus, TaskPriority } from '../tasks/entities/task.entity';
import { Comment } from '../tasks/entities/comment.entity';
import { Sprint } from '../sprints/entities/sprint.entity';
import { User } from '../users/entities/user.entity';
import { Cost } from '../costs/entities/cost.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { Budget } from '../budgets/entities/budget.entity';
import { Notification } from '../notifications/entities/notification.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Sprint)
    private sprintsRepository: Repository<Sprint>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Cost)
    private costsRepository: Repository<Cost>,
    @InjectRepository(Expense)
    private expensesRepository: Repository<Expense>,
    @InjectRepository(Budget)
    private budgetsRepository: Repository<Budget>,
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async getDashboardData(userId: string) {
    try {
      // Get all projects (for now, get all projects regardless of owner)
      // In production, filter by userId when ownerId field exists
      const projects = await this.projectsRepository.find({
        relations: ['tasks', 'members'],
      }).catch(() => []);

      // Get all tasks
      const allTasks = await this.tasksRepository.find({
        relations: ['project', 'createdBy'],
      }).catch(() => []);

      // Optimization: Get comment counts per user (avoids loading all comments for all tasks)
      const commentCounts = await this.commentsRepository
        .createQueryBuilder('comment')
        .select('comment.authorId', 'authorId')
        .addSelect('COUNT(comment.id)', 'count')
        .groupBy('comment.authorId')
        .getRawMany();

      const commentCountMap = new Map<string, number>(
        commentCounts.map((c) => [c.authorId, parseInt(c.count, 10) || 0]),
      );

      // Get active sprints and ensure their counts are true
      const activeSprints = await this.sprintsRepository.find({
        where: { status: 'active' as any },
        relations: ['project'],
      }).catch(() => []);

      // Optimization: Get task counts for all active sprints in one query using database aggregation
      const sprintIds = activeSprints.map((s) => s.id);

      if (sprintIds.length > 0) {
        const counts = await this.tasksRepository
          .createQueryBuilder('task')
          .select('task.sprintId', 'sprintId')
          .addSelect('COUNT(task.uid)', 'count')
          .addSelect(
            "SUM(CASE WHEN task.status = 'complete' THEN 1 ELSE 0 END)",
            'completedCount',
          )
          .where('task.sprintId IN (:...sprintIds)', { sprintIds })
          .groupBy('task.sprintId')
          .getRawMany();

        const countMap = new Map(
          counts.map((c) => [
            c.sprintId,
            {
              count: parseInt(c.count, 10) || 0,
              completedCount: parseInt(c.completedCount, 10) || 0,
            },
          ]),
        );

        for (const sprint of activeSprints) {
          const stats = countMap.get(sprint.id) || {
            count: 0,
            completedCount: 0,
          };

          if (
            sprint.taskCount !== stats.count ||
            sprint.completedTaskCount !== stats.completedCount
          ) {
            sprint.taskCount = stats.count;
            sprint.completedTaskCount = stats.completedCount;

            // Optionally save back to database if they changed
            await this.sprintsRepository.update(sprint.id, {
              taskCount: sprint.taskCount,
              completedTaskCount: sprint.completedTaskCount,
            });
          }
        }
      }

      // Get team members (all users for now)
      const teamMembers = await this.usersRepository.find({
        select: ['id', 'name', 'email', 'avatar', 'role', 'status', 'createdAt', 'updatedAt'],
      }).catch(() => []);

      // Calculate workspace overview
      const healthScore = this.calculateHealthScore(projects, allTasks);
      
      // Calculate health trend based on project progress and task completion
      let totalProgress = 0;
      for (const p of projects) {
        totalProgress += p.progress || 0;
      }
      const avgProgress = projects.length > 0 ? totalProgress / projects.length : 0;
      const completionRate = allTasks.length > 0
        ? (allTasks.filter((t) => t.status === 'complete').length / allTasks.length) * 100
        : 0;
      
      // Determine trend: up if health score > 70, stable if 50-70, down if < 50
      let healthTrend: 'up' | 'down' | 'stable' = 'stable';
      if (healthScore >= 70) {
        healthTrend = 'up';
      } else if (healthScore < 50) {
        healthTrend = 'down';
      }
      
      const workspaceOverview = {
        totalProjects: projects.length,
        activeSprints: activeSprints.length,
        teamMembers: teamMembers.length,
        healthScore: Math.round(healthScore),
        healthTrend,
      };

      // Calculate project statistics
      const projectStatistics = this.calculateProjectStatistics(allTasks);

      // Calculate task insights
      const taskInsights = this.calculateTaskInsights(allTasks);

      // Calculate timeline snapshot
      const timelineSnapshot = this.calculateTimelineSnapshot(projects, allTasks, activeSprints);

      // Get user activity (from notifications or create from tasks)
      const userActivity = await this.getUserActivity(userId);

      // Calculate user contributions
      const userContributions = this.calculateUserContributions(
        allTasks,
        teamMembers,
        commentCountMap,
      );

      // Calculate budget and cost metrics
      const budgetCostMetrics = await this.calculateBudgetCostMetrics(projects);

      // Create a map for quick lookup of project budgets
      const projectBudgetMap = new Map(
        budgetCostMetrics.projectBudgets.map((pb) => [pb.projectId, pb]),
      );

      // Transform projects to DashboardProject format
      const dashboardProjects = projects.map((project) => ({
        id: project.uid, // Use uid as id for frontend compatibility
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'active',
        progress: project.progress || 0,
        taskCount: project.tasks?.length || 0,
        completedTaskCount: project.tasks?.filter((t) => t?.status === 'complete').length || 0,
        teamMemberIds: project.members?.map((m) => m.userId) || [],
        color: project.color || '#6366f1',
        icon: project.icon || 'folder',
        budget: this.calculateProjectBudget(project.uid, projectBudgetMap.get(project.uid)),
        startDate: project.startDate || null,
        endDate: project.endDate || null,
        createdAt: project.createdAt || new Date(),
        updatedAt: project.updatedAt || new Date(),
      }));

      // Transform sprints
      const dashboardSprints = activeSprints.map((sprint) => ({
        id: sprint.id,
        name: sprint.name || '',
        projectId: sprint.projectId || null,
        startDate: sprint.startDate || null,
        endDate: sprint.endDate || null,
        status: sprint.status || 'active',
        goal: sprint.goal || '',
        taskCount: sprint.taskCount || 0,
        completedTaskCount: sprint.completedTaskCount || 0,
        createdAt: sprint.createdAt || new Date(),
        updatedAt: sprint.updatedAt || new Date(),
      }));

      // Transform team members
      const dashboardTeamMembers = teamMembers.map((member) => ({
        id: member.id,
        name: member.name || 'Unknown',
        email: member.email || '',
        avatar: member.avatar || null,
        role: member.role || 'member',
        status: member.status === 'online' ? 'active' : (member.status as any) || 'inactive',
        taskCount: allTasks.filter((t) => t.assigneeIds?.includes(member.id)).length,
        createdAt: member.createdAt || new Date(),
        updatedAt: member.updatedAt || new Date(),
      }));

      return {
        workspaceOverview,
        projectStatistics,
        taskInsights,
        timelineSnapshot,
        userActivity,
        userContributions,
        budgetCostMetrics,
        projects: dashboardProjects,
        sprints: dashboardSprints,
        teamMembers: dashboardTeamMembers,
      };
    } catch (error) {
      console.error('Error in getDashboardData:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      throw error;
    }
  }

  async getMonthlyProjectOverview(userId: string, period: 'week' | 'month' | 'year' = 'month') {
    try {
      // Get all projects
      const projects = await this.projectsRepository.find().catch(() => []);
      console.log(`[ProjectOverview] Found ${projects.length} projects`);

      // Get all tasks with projectId to ensure we capture all tasks
      const allTasks = await this.tasksRepository.find({
        relations: ['project'],
      }).catch(() => []);
      console.log(`[ProjectOverview] Found ${allTasks.length} total tasks`);

      // Group tasks by projectId for easier lookup
      const tasksByProjectId: { [key: string]: Task[] } = {};
      allTasks.forEach((task) => {
        if (task.projectId) {
          if (!tasksByProjectId[task.projectId]) {
            tasksByProjectId[task.projectId] = [];
          }
          tasksByProjectId[task.projectId].push(task);
        }
      });
      
      console.log(`[ProjectOverview] Tasks grouped by project:`, Object.keys(tasksByProjectId).map(pid => ({
        projectId: pid,
        taskCount: tasksByProjectId[pid].length
      })));

      const now = new Date();
      const months: { month: string; completed: number; total: number; isProjected?: boolean; isHighlighted?: boolean }[] = [];
      
      // Determine number of months to show based on period
      let monthsToShow = 5; // Default: last 5 months
      if (period === 'week') {
        monthsToShow = 1; // Show current month only for week view
      } else if (period === 'year') {
        monthsToShow = 12; // Show last 12 months for year view
      }

      // Generate monthly data
      for (let i = monthsToShow - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
        
        // Check if this is a future month
        const isProjected = date > now;
        const isCurrentMonth = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();

        let completed = 0;
        let total = 0;

        if (!isProjected) {
          if (isCurrentMonth) {
            // For current month: Show ALL tasks from ALL projects (regardless of creation date)
            projects.forEach((project) => {
              const projectTasks = tasksByProjectId[project.uid] || [];
              total += projectTasks.length;
              completed += projectTasks.filter(t => t.status === 'complete').length;
            });
            
            // Also count standalone tasks (no projectId)
            allTasks.forEach((task) => {
              if (!task.projectId) {
                total++;
                if (task.status === 'complete') {
                  completed++;
                }
              }
            });
            
            // If no tasks but projects exist, show at least 1 to indicate projects exist
            if (total === 0 && projects.length > 0) {
              total = 1;
            }
          } else {
            // For past months: Show tasks created or completed in that month
            projects.forEach((project) => {
              const projectTasks = tasksByProjectId[project.uid] || [];
              projectTasks.forEach((task) => {
                const taskCreatedDate = task.createdAt ? new Date(task.createdAt) : null;
                const taskUpdatedDate = task.updatedAt ? new Date(task.updatedAt) : null;
                
                // Task was created in this month
                if (taskCreatedDate && taskCreatedDate >= monthStart && taskCreatedDate <= monthEnd) {
                  total++;
                  if (task.status === 'complete') {
                    completed++;
                  }
                }
                // Task was completed in this month (even if created earlier)
                else if (task.status === 'complete' && taskUpdatedDate && taskUpdatedDate >= monthStart && taskUpdatedDate <= monthEnd) {
                  total++;
                  completed++;
                }
              });
            });
            
            // Count standalone tasks created/updated in this month
            allTasks.forEach((task) => {
              if (!task.projectId) {
                const taskDate = task.createdAt || task.updatedAt || new Date();
                if (taskDate >= monthStart && taskDate <= monthEnd) {
                  total++;
                  if (task.status === 'complete') {
                    completed++;
                  }
                }
              }
            });
          }
        }
        
        months.push({
          month: monthKey,
          completed: completed || 0,
          total: total || 0,
          isProjected,
          isHighlighted: isCurrentMonth, // Highlight current month
        });
      }

      // If no data at all but projects exist, ensure we show data
      const hasAnyData = months.some(m => m.total > 0);
      console.log(`[ProjectOverview] Has any data: ${hasAnyData}, Projects: ${projects.length}, Tasks: ${allTasks.length}`);
      
      // Final check: ensure current month has data if projects exist
      if (projects.length > 0) {
        const currentMonthKey = now.toLocaleDateString('en-US', { month: 'short' });
        const currentMonthIndex = months.findIndex(m => m.month === currentMonthKey);
        if (currentMonthIndex >= 0 && months[currentMonthIndex].total === 0) {
          // Double-check: count all tasks one more time
          let finalTotal = 0;
          let finalCompleted = 0;
          
          projects.forEach((project) => {
            const projectTasks = tasksByProjectId[project.uid] || [];
            finalTotal += projectTasks.length;
            finalCompleted += projectTasks.filter(t => t.status === 'complete').length;
          });
          
          allTasks.forEach((task) => {
            if (!task.projectId) {
              finalTotal++;
              if (task.status === 'complete') {
                finalCompleted++;
              }
            }
          });
          
          // If still no tasks, show at least 1 to indicate projects exist
          if (finalTotal === 0) {
            finalTotal = 1;
          }
          
          months[currentMonthIndex].total = finalTotal;
          months[currentMonthIndex].completed = finalCompleted;
          console.log(`[ProjectOverview] Final current month data: ${finalTotal} total, ${finalCompleted} completed`);
        }
      }

      console.log(`[ProjectOverview] Returning ${months.length} months of data:`, months.map(m => `${m.month}: ${m.total} total, ${m.completed} completed`));
      return months;
    } catch (error) {
      console.error('Error in getMonthlyProjectOverview:', error);
      return [];
    }
  }

  async getProjectStatistics(projectId?: string) {
    const where = projectId ? { projectId } : {};
    const tasks = await this.tasksRepository.find({
      where,
      relations: ['project'],
    });

    return this.calculateProjectStatistics(tasks);
  }

  private calculateHealthScore(projects: Project[], tasks: Task[]): number {
    if (tasks.length === 0 && projects.length === 0) {
      return 50; // Neutral score when no data
    }

    // Calculate task-based health
    const completedTasks = tasks.filter((t) => t.status === 'complete').length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 50;

    const overdueTasks = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'complete',
    ).length;
    const overdueRate = totalTasks > 0 ? (overdueTasks / totalTasks) * 100 : 0;

    // Calculate project-based health
    const activeProjects = projects.filter((p) => p.status === 'active').length;
    const totalProjects = projects.length;
    const projectHealth = totalProjects > 0 ? (activeProjects / totalProjects) * 100 : 50;

    // Average project progress
    const avgProjectProgress = projects.length > 0
      ? projects.reduce((sum: number, p: Project) => sum + (p.progress || 0), 0) / projects.length
      : 0;

    // Combined health score: 40% completion, 30% project health, 20% progress, 10% penalty for overdue
    const taskHealth = completionRate * 0.4;
    const projectHealthScore = projectHealth * 0.3;
    const progressScore = avgProjectProgress * 0.2;
    const overduePenalty = overdueRate * 0.1;

    const healthScore = taskHealth + projectHealthScore + progressScore - overduePenalty;
    
    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, Math.round(healthScore)));
  }

  private calculateProjectStatistics(tasks: Task[]) {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'complete').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length;
    const todoTasks = tasks.filter((t) => t.status === 'todo').length;
    
    // Calculate progress percentage: completed + 50% of in-progress
    const progressPercentage = totalTasks > 0 
      ? Math.round(((completedTasks + (inProgressTasks * 0.5)) / totalTasks) * 100)
      : 0;
    
    // Ensure progress is between 0 and 100
    const safeProgressPercentage = Math.max(0, Math.min(100, progressPercentage));

    // Generate burn-down data (last 14 days)
    const burnDownData = this.generateBurnDownData(tasks);

    const taskDistribution = {
      todo: todoTasks,
      'in-progress': inProgressTasks,
      complete: completedTasks,
      backlog: tasks.filter((t) => t.status === 'backlog').length,
    };

    const priorityAnalysis = {
      low: tasks.filter((t) => t.priority === 'low').length,
      medium: tasks.filter((t) => t.priority === 'medium').length,
      high: tasks.filter((t) => t.priority === 'high').length,
      urgent: tasks.filter((t) => t.priority === 'urgent').length,
    };

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      progressPercentage: safeProgressPercentage,
      burnDownData,
      taskDistribution,
      priorityAnalysis,
    };
  }

  private calculateTaskInsights(tasks: Task[]) {
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const overdueTasks = tasks
      .filter((t) => t?.dueDate && new Date(t.dueDate) < now && t?.status !== 'complete')
      .slice(0, 10)
      .map((t) => this.transformTask(t))
      .filter((t) => t !== null);

    const tasksDueThisWeek = tasks
      .filter(
        (t) =>
          t?.dueDate &&
          new Date(t.dueDate) >= now &&
          new Date(t.dueDate) <= nextWeek &&
          t?.status !== 'complete',
      )
      .slice(0, 10)
      .map((t) => this.transformTask(t))
      .filter((t) => t !== null);

    const recentlyCompleted = tasks
      .filter((t) => t?.status === 'complete')
      .sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0))
      .slice(0, 5)
      .map((t) => this.transformTask(t))
      .filter((t) => t !== null);

    // Calculate productivity index
    const productivityIndex = this.calculateProductivityIndex(tasks);

    return {
      overdueTasks,
      tasksDueThisWeek,
      recentlyCompleted,
      productivityIndex,
    };
  }

  private calculateTimelineSnapshot(projects: Project[], tasks: Task[], sprints: Sprint[]) {
    const now = new Date();
    const upcomingDeadlines = [];

    // Add sprint deadlines
    sprints.forEach((sprint) => {
      const endDate = new Date(sprint.endDate);
      if (endDate > now && !isNaN(endDate.getTime())) {
        upcomingDeadlines.push({
          id: sprint.id,
          title: sprint.name,
          date: endDate,
          projectId: sprint.projectId,
          projectName: projects.find((p) => p.uid === sprint.projectId)?.name || 'Unknown',
          type: 'sprint' as const,
        });
      }
    });

    // Add task deadlines
    tasks
      .filter((t) => {
        if (!t.dueDate) return false;
        const dueDate = new Date(t.dueDate);
        return !isNaN(dueDate.getTime()) && dueDate > now;
      })
      .slice(0, 5)
      .forEach((task) => {
        const dueDate = new Date(task.dueDate!);
        upcomingDeadlines.push({
          id: task.uid,
          title: task.title,
          date: dueDate,
          projectId: task.projectId || '',
          projectName: projects.find((p) => p.uid === task.projectId)?.name || 'Unknown',
          taskId: task.uid,
          type: 'task' as const,
        });
      });

    upcomingDeadlines.sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    const blockedTasks = tasks
      .filter((t) => t?.status === 'todo' && t?.priority === 'urgent')
      .slice(0, 5)
      .map((t) => this.transformTask(t))
      .filter((t) => t !== null);

    return {
      upcomingDeadlines: upcomingDeadlines.slice(0, 10),
      blockedTasks,
    };
  }

  private async getUserActivity(userId: string) {
    try {
      // Get recent notifications as activity
      const notifications = await this.notificationsRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: 20,
        relations: ['user', 'project', 'task'],
      });

      // Extract unique project IDs and task IDs
      const projectIds = [
        ...new Set(
          notifications
            .map((n) => n.projectId)
            .filter((id): id is string => !!id),
        ),
      ];
      const taskIds = [
        ...new Set(
          notifications.map((n) => n.taskId).filter((id): id is string => !!id),
        ),
      ];

      // Fetch projects and tasks
      let projects: Project[] = [];
      let tasks: Task[] = [];

      if (projectIds.length > 0) {
        projects = await this.projectsRepository.find({
          where: { uid: In(projectIds) },
          select: ['uid', 'name'],
        });
      }

      if (taskIds.length > 0) {
        tasks = await this.tasksRepository.find({
          where: { uid: In(taskIds) },
          select: ['uid', 'title'],
        });
      }

      // Create lookups
      const projectMap = new Map(projects.map((p) => [p.uid, p.name]));
      const taskMap = new Map(tasks.map((t) => [t.uid, t.title]));

      return notifications.map((notif) => ({
        id: notif.id,
        userId: notif.userId,
        userName: notif.user?.name || 'Unknown User',
        userAvatar: notif.user?.avatar || null,
        type: this.mapNotificationTypeToActivityType(notif.type),
        description: notif.message || '',
        projectId: notif.projectId || null,
        projectName: notif.projectId
          ? projectMap.get(notif.projectId) || 'Unknown Project'
          : undefined,
        taskId: notif.taskId || null,
        taskTitle: notif.taskId
          ? taskMap.get(notif.taskId) || 'Unknown Task'
          : undefined,
        createdAt: notif.createdAt,
        updatedAt: notif.updatedAt,
      }));
    } catch (error) {
      console.error('Error getting user activity:', error);
      // Return empty array if there's an error
      return [];
    }
  }

  private calculateUserContributions(
    tasks: Task[],
    users: User[],
    commentCountMap?: Map<string, number>,
  ) {
    return users.map((user) => {
      const userTasks = tasks.filter((t) => t.assigneeIds?.includes(user.id));
      const completedTasks = userTasks.filter((t) => t?.status === 'complete');
      const createdTasks = tasks.filter((t) => t.createdById === user.id);

      let comments = 0;
      if (commentCountMap) {
        comments = commentCountMap.get(user.id) || 0;
      } else {
        comments = tasks.reduce(
          (sum, t) =>
            sum +
            (t.comments?.filter((c) => c?.authorId === user.id).length || 0),
          0,
        );
      }

      return {
        userId: user.id,
        userName: user.name || 'Unknown',
        userAvatar: user.avatar || null,
        tasksCompleted: completedTasks.length,
        tasksCreated: createdTasks.length,
        commentsAdded: comments,
        totalPoints:
          completedTasks.length * 5 + createdTasks.length * 3 + comments,
      };
    });
  }

  private async calculatePerformanceMetrics(projects: Project[], tasks: Task[], sprints: Sprint[]) {
    const completedTasks = tasks.filter((t) => t.status === 'complete');
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

    // Calculate average completion time (for completed tasks with dates)
    const tasksWithCompletionTime = completedTasks
      .filter((t) => t.createdAt && t.updatedAt)
      .map((t) => {
        const created = new Date(t.createdAt!).getTime();
        const completed = new Date(t.updatedAt!).getTime();
        return (completed - created) / (1000 * 60 * 60 * 24); // days
      });

    const avgCompletionTime = tasksWithCompletionTime.length > 0
      ? tasksWithCompletionTime.reduce((a, b) => a + b, 0) / tasksWithCompletionTime.length
      : 0;

    // Calculate on-time delivery rate
    const tasksWithDueDate = tasks.filter((t) => t.dueDate && t.status === 'complete');
    const onTimeTasks = tasksWithDueDate.filter((t) => {
      const dueDate = new Date(t.dueDate!).getTime();
      const completedDate = new Date(t.updatedAt!).getTime();
      return completedDate <= dueDate;
    });
    const onTimeRate = tasksWithDueDate.length > 0
      ? (onTimeTasks.length / tasksWithDueDate.length) * 100
      : 0;

    // Calculate sprint velocity (tasks completed per sprint)
    const activeSprintTasks = tasks.filter((t) => {
      // Check if task belongs to an active sprint's project
      return sprints.some((s) => s.projectId === t.projectId);
    });
    const sprintVelocity = sprints.length > 0
      ? activeSprintTasks.filter((t) => t.status === 'complete').length / sprints.length
      : 0;

    return {
      completionRate: Math.round(completionRate * 10) / 10,
      avgCompletionTime: Math.round(avgCompletionTime * 10) / 10,
      onTimeRate: Math.round(onTimeRate * 10) / 10,
      sprintVelocity: Math.round(sprintVelocity * 10) / 10,
    };
  }

  private async calculateBudgetCostMetrics(projects: Project[]) {
    try {
      // Optimization: Use aggregation queries instead of fetching all records
      const [budgetSums, costSums, expenseSums] = await Promise.all([
        this.budgetsRepository
          .createQueryBuilder('budget')
          .select('budget.projectId', 'projectId')
          .addSelect('SUM(budget.amount)', 'total')
          .groupBy('budget.projectId')
          .getRawMany(),
        this.costsRepository
          .createQueryBuilder('cost')
          .select('cost.projectId', 'projectId')
          .addSelect('SUM(cost.amount)', 'total')
          .groupBy('cost.projectId')
          .getRawMany(),
        this.expensesRepository
          .createQueryBuilder('expense')
          .select('expense.projectId', 'projectId')
          .addSelect('SUM(expense.amount)', 'total')
          .groupBy('expense.projectId')
          .getRawMany(),
      ]);

      const parseSum = (item: any) =>
        item.total ? parseFloat(item.total) : 0;

      // Create lookup maps
      const budgetMap = new Map<string, number>();
      let totalBudget = 0;
      budgetSums.forEach((b) => {
        const val = parseSum(b);
        totalBudget += val;
        if (b.projectId) budgetMap.set(b.projectId, val);
      });

      const costMap = new Map<string, number>();
      let totalCosts = 0;
      costSums.forEach((c) => {
        const val = parseSum(c);
        totalCosts += val;
        if (c.projectId) costMap.set(c.projectId, val);
      });

      const expenseMap = new Map<string, number>();
      let totalExpenses = 0;
      expenseSums.forEach((e) => {
        const val = parseSum(e);
        totalExpenses += val;
        if (e.projectId) expenseMap.set(e.projectId, val);
      });

      const totalSpent = totalCosts + totalExpenses;
      const remainingBudget = totalBudget - totalSpent;
      const budgetUtilization =
        totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

      // Group by project using maps
      const projectBudgets = projects.map((project) => {
        const projectBudget = budgetMap.get(project.uid) || 0;
        const projectCosts = costMap.get(project.uid) || 0;
        const projectExpenses = expenseMap.get(project.uid) || 0;

        const projectSpent = projectCosts + projectExpenses;
        const projectRemaining = projectBudget - projectSpent;

        return {
          projectId: project.uid,
          projectName: project.name || 'Unknown',
          budget: projectBudget,
          spent: projectSpent,
          remaining: projectRemaining,
          utilization:
            projectBudget > 0 ? (projectSpent / projectBudget) * 100 : 0,
        };
      });

      // Fetch only recent data for cost trend (last 6 months)
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

      const [recentCosts, recentExpenses] = await Promise.all([
        this.costsRepository.find({
          where: { date: MoreThanOrEqual(sixMonthsAgo) },
        }),
        this.expensesRepository.find({
          where: { startDate: MoreThanOrEqual(sixMonthsAgo) },
        }),
      ]);

      // Calculate cost trend (monthly costs for last 6 months)
      const costTrend = this.calculateCostTrend(recentCosts, recentExpenses);

      return {
        totalBudget,
        totalSpent,
        remainingBudget,
        budgetUtilization: Math.round(budgetUtilization * 10) / 10,
        projectBudgets: projectBudgets.filter(
          (pb) => pb.budget > 0 || pb.spent > 0,
        ),
        costTrend,
      };
    } catch (error) {
      console.error('Error calculating budget cost metrics:', error);
      return {
        totalBudget: 0,
        totalSpent: 0,
        remainingBudget: 0,
        budgetUtilization: 0,
        projectBudgets: [],
        costTrend: [],
      };
    }
  }

  private calculateCostTrend(costs: Cost[], expenses: Expense[]) {
    const now = new Date();
    const months: { month: string; cost: number; expense: number; total: number }[] = [];
    
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
      
      let monthCost = 0;
      let monthExpense = 0;
      
      // Sum costs for this month
      for (const cost of costs) {
        if (cost.date) {
          const costDate = new Date(cost.date);
          if (costDate >= monthStart && costDate <= monthEnd) {
            const amount = typeof cost.amount === 'string' ? parseFloat(cost.amount) : Number(cost.amount || 0);
            monthCost += isNaN(amount) ? 0 : amount;
          }
        }
      }
      
      // Sum expenses for this month
      for (const expense of expenses) {
        if (expense.startDate) {
          const expenseDate = new Date(expense.startDate);
          if (expenseDate >= monthStart && expenseDate <= monthEnd) {
            const amount = typeof expense.amount === 'string' ? parseFloat(expense.amount) : Number(expense.amount || 0);
            monthExpense += isNaN(amount) ? 0 : amount;
          }
        }
      }
      
      months.push({
        month: monthKey,
        cost: monthCost,
        expense: monthExpense,
        total: monthCost + monthExpense,
      });
    }
    
    return months;
  }

  private calculateProjectBudget(
    projectId: string,
    budgetData?: { budget: number; spent: number; remaining: number },
  ) {
    if (!budgetData) {
      return {
        total: 0,
        currency: 'USD' as const,
        spent: 0,
        remaining: 0,
      };
    }
    return {
      total: budgetData.budget,
      currency: 'USD' as const,
      spent: budgetData.spent,
      remaining: budgetData.remaining,
    };
  }

  private transformTask(task: Task) {
    if (!task) {
      return null;
    }
    
    return {
      uid: task.uid || '',
      identifier: task.identifier || '',
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      assignees: task.assigneeIds || [], // Frontend expects string array (will be user IDs or names)
      dueDate: task.dueDate || null,
      startDate: task.startDate || null,
      subtasks: task.subtasks?.map((s) => ({
        id: s?.id || 0,
        title: s?.title || '',
        completed: s?.completed || false,
      })) || [],
      comments: task.comments?.map((c) => ({
        id: c?.id || 0,
        text: c?.text || '',
        author: c?.author?.name || 'Unknown',
        createdAt: c?.createdAt || new Date(),
      })) || [],
      attachments: task.attachments?.length || 0,
      estimatedCost: task.estimatedCost || 0,
    };
  }

  private generateBurnDownData(tasks: Task[]) {
    const days = 14;
    const now = new Date();
    const data = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (days - i));
      const remaining = tasks.filter(
        (t) => t.status !== 'complete' && (!t.createdAt || new Date(t.createdAt) <= date),
      ).length;
      const ideal = Math.max(0, tasks.length - (tasks.length / days) * i);

      data.push({
        date,
        remaining,
        ideal: Math.round(ideal),
      });
    }

    return data;
  }

  private calculateProductivityIndex(tasks: Task[]): number {
    if (tasks.length === 0) return 50; // Neutral score when no tasks

    const completed = tasks.filter((t) => t.status === 'complete').length;
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
    const overdue = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'complete',
    ).length;
    const onTime = tasks.filter(
      (t) => t.dueDate && 
      new Date(t.dueDate) >= new Date() && 
      (t.status === 'complete' || t.status === 'in-progress'),
    ).length;

    // Calculate rates
    const completionRate = (completed / tasks.length) * 100;
    const progressRate = (inProgress / tasks.length) * 50;
    const onTimeRate = (onTime / tasks.length) * 20;
    const overduePenalty = (overdue / tasks.length) * 40; // Increased penalty

    // Productivity = completion + progress + on-time bonus - overdue penalty
    const productivity = completionRate + progressRate + onTimeRate - overduePenalty;

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, Math.round(productivity)));
  }

  private mapNotificationTypeToActivityType(
    type: string,
  ): 'task_created' | 'task_completed' | 'task_updated' | 'comment_added' | 'project_created' {
    switch (type) {
      case 'task':
        return 'task_created';
      case 'project':
        return 'project_created';
      default:
        return 'task_updated';
    }
  }
}

