import { BaseEntity } from "./base.interface";
import { Task, TaskStatus, TaskPriority } from "./task.interface";
import { DashboardProject } from "./project.interface";

export interface Sprint extends BaseEntity {
  name: string;
  projectId: string;
  startDate: Date;
  endDate: Date;
  status: "planned" | "active" | "completed";
  goal?: string;
  taskCount: number;
  completedTaskCount: number;
}

export interface TeamMember extends BaseEntity {
  name: string;
  email: string;
  avatar?: string;
  role: string;
  status: "active" | "away" | "offline";
  taskCount: number;
}

export interface WorkspaceOverview {
  totalProjects: number;
  activeSprints: number;
  teamMembers: number;
  healthScore: number; // 0-100
  healthTrend: "up" | "down" | "stable";
}

export interface ProjectStatistics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  progressPercentage: number;
  burnDownData: BurnDownDataPoint[];
  taskDistribution: TaskDistribution;
  priorityAnalysis: PriorityAnalysis;
}

export interface BurnDownDataPoint {
  date: Date;
  remaining: number;
  ideal: number;
}

export type TaskDistribution = {
  [K in TaskStatus]: number;
}

export type PriorityAnalysis = {
  [K in TaskPriority]: number;
}

export interface TaskInsights {
  overdueTasks: Task[];
  tasksDueThisWeek: Task[];
  recentlyCompleted: Task[];
  productivityIndex: number; // 0-100
}

export interface TimelineSnapshot {
  upcomingDeadlines: Deadline[];
  blockedTasks: Task[];
}

export interface Deadline {
  id: string;
  title: string;
  date: Date;
  projectId: string;
  projectName: string;
  taskId?: string;
  type: "task" | "sprint" | "milestone";
}

export interface UserActivity extends BaseEntity {
  userId: string;
  userName: string;
  userAvatar?: string;
  type: "task_created" | "task_completed" | "task_updated" | "comment_added" | "project_created";
  description: string;
  projectId?: string;
  projectName?: string;
  taskId?: string;
  taskTitle?: string;
}

export interface UserContribution {
  userId: string;
  userName: string;
  userAvatar?: string;
  tasksCompleted: number;
  tasksCreated: number;
  commentsAdded: number;
  totalPoints: number;
}

export interface ProjectBudget {
  projectId: string;
  projectName: string;
  budget: number;
  spent: number;
  remaining: number;
  utilization: number; // 0-100
}

export interface CostTrendDataPoint {
  month: string;
  cost: number;
  expense: number;
  total: number;
}

export interface BudgetCostMetrics {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  budgetUtilization: number; // 0-100
  projectBudgets: ProjectBudget[];
  costTrend: CostTrendDataPoint[];
}

export interface DashboardData {
  workspaceOverview: WorkspaceOverview;
  projectStatistics: ProjectStatistics;
  taskInsights: TaskInsights;
  timelineSnapshot: TimelineSnapshot;
  userActivity: UserActivity[];
  userContributions: UserContribution[];
  budgetCostMetrics: BudgetCostMetrics;
  projects: DashboardProject[];
  sprints: Sprint[];
  teamMembers: TeamMember[];
}

