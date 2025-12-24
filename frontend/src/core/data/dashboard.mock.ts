import { DashboardData } from "@/interfaces/dashboard.interface";
import { Task, TaskStatus, TaskPriority } from "@/interfaces/task.interface";
import { generateUniqueId } from "@/lib/utils";

// Generate mock dates
const now = new Date();
const yesterday = new Date(now);
yesterday.setDate(yesterday.getDate() - 1);
const lastWeek = new Date(now);
lastWeek.setDate(lastWeek.getDate() - 7);
const nextWeek = new Date(now);
nextWeek.setDate(nextWeek.getDate() + 7);
const twoWeeksAgo = new Date(now);
twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

// Mock tasks
const mockTasks: Task[] = [
  {
    uid: generateUniqueId(),
    identifier: "TASK-001",
    title: "Implement user authentication",
    description: "Set up JWT-based authentication system",
    status: "in-progress",
    priority: "high",
    assignees: ["John Doe", "Sarah Smith"],
    dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
    subtasks: [
      { id: "1", title: "Setup JWT tokens", completed: true },
      { id: "2", title: "Create login endpoint", completed: true },
      { id: "3", title: "Add password reset", completed: false },
    ],
    comments: [],
    attachments: 2,
  },
  {
    uid: generateUniqueId(),
    identifier: "TASK-002",
    title: "Design landing page",
    description: "Create modern and responsive landing page design",
    status: "todo",
    priority: "urgent",
    assignees: ["Mike Johnson"],
    dueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // Overdue
    subtasks: [],
    comments: [],
    attachments: 0,
  },
  {
    uid: generateUniqueId(),
    identifier: "TASK-003",
    title: "Write unit tests",
    description: "Add comprehensive unit tests for core features",
    status: "complete",
    priority: "medium",
    assignees: ["John Doe"],
    dueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    subtasks: [
      { id: "1", title: "Test authentication", completed: true },
      { id: "2", title: "Test API endpoints", completed: true },
    ],
    comments: [],
    attachments: 1,
  },
  {
    uid: generateUniqueId(),
    identifier: "TASK-004",
    title: "Setup CI/CD pipeline",
    description: "Configure continuous integration and deployment",
    status: "in-progress",
    priority: "high",
    assignees: ["Sarah Smith", "Mike Johnson"],
    dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
    subtasks: [],
    comments: [],
    attachments: 0,
  },
  {
    uid: generateUniqueId(),
    identifier: "TASK-005",
    title: "Database migration",
    description: "Migrate database schema to new version",
    status: "backlog",
    priority: "low",
    assignees: [],
    dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
    subtasks: [],
    comments: [],
    attachments: 0,
  },
  {
    uid: generateUniqueId(),
    identifier: "TASK-006",
    title: "Fix critical bug in payment",
    description: "Resolve payment processing issue",
    status: "todo",
    priority: "urgent",
    assignees: ["John Doe"],
    dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
    subtasks: [],
    comments: [],
    attachments: 0,
  },
  {
    uid: generateUniqueId(),
    identifier: "TASK-007",
    title: "Update documentation",
    description: "Update API and user documentation",
    status: "complete",
    priority: "medium",
    assignees: ["Sarah Smith"],
    dueDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    subtasks: [],
    comments: [],
    attachments: 3,
  },
];

// Generate burn-down data
const generateBurnDownData = () => {
  const days = 14;
  const initialTasks = 50;
  const idealRate = initialTasks / days;
  const data = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - i));
    const ideal = Math.max(0, initialTasks - idealRate * i);
    const remaining = Math.max(0, ideal - Math.random() * 5 + 2);
    data.push({
      date,
      remaining: Math.round(remaining),
      ideal: Math.round(ideal),
    });
  }

  return data;
};

export const mockDashboardData: DashboardData = {
  workspaceOverview: {
    totalProjects: 12,
    activeSprints: 3,
    teamMembers: 8,
    healthScore: 85,
    healthTrend: "up",
  },
  projectStatistics: {
    totalTasks: 127,
    completedTasks: 89,
    inProgressTasks: 23,
    todoTasks: 15,
    progressPercentage: 70,
    burnDownData: generateBurnDownData(),
    taskDistribution: {
      todo: 15,
      "in-progress": 23,
      complete: 89,
      backlog: 0,
    },
    priorityAnalysis: {
      low: 20,
      medium: 45,
      high: 35,
      urgent: 27,
    },
  },
  taskInsights: {
    overdueTasks: mockTasks.filter(
      (task) =>
        task.dueDate &&
        new Date(task.dueDate) < now &&
        task.status !== "complete"
    ),
    tasksDueThisWeek: mockTasks.filter(
      (task) =>
        task.dueDate &&
        new Date(task.dueDate) >= now &&
        new Date(task.dueDate) <= nextWeek &&
        task.status !== "complete"
    ),
    recentlyCompleted: mockTasks
      .filter((task) => task.status === "complete")
      .slice(0, 5),
    productivityIndex: 78,
  },
  timelineSnapshot: {
    upcomingDeadlines: [
      {
        id: generateUniqueId(),
        title: "Sprint 1 Review",
        date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        projectId: "prjweb001",
        projectName: "Web Development",
        type: "sprint",
      },
      {
        id: generateUniqueId(),
        title: "Release v1.0",
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        projectId: "prjweb001",
        projectName: "Web Development",
        type: "milestone",
      },
      {
        id: generateUniqueId(),
        title: mockTasks[0].title,
        date: mockTasks[0].dueDate!,
        projectId: "prjweb001",
        projectName: "Web Development",
        taskId: mockTasks[0].uid,
        type: "task",
      },
    ],
    blockedTasks: mockTasks.filter((task) => task.status === "todo" && task.priority === "urgent"),
  },
  userActivity: [
    {
      id: generateUniqueId(),
      userId: "1",
      userName: "John Doe",
      userAvatar: "https://github.com/shadcn.png",
      type: "task_completed",
      description: "completed task",
      projectId: "1",
      projectName: "Web Development",
      taskId: mockTasks[2].uid,
      taskTitle: mockTasks[2].title,
      createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
    },
    {
      id: generateUniqueId(),
      userId: "2",
      userName: "Sarah Smith",
      userAvatar: "https://github.com/shadcn.png",
      type: "comment_added",
      description: "added a comment",
      projectId: "1",
      projectName: "Web Development",
      taskId: mockTasks[0].uid,
      taskTitle: mockTasks[0].title,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    },
    {
      id: generateUniqueId(),
      userId: "3",
      userName: "Mike Johnson",
      userAvatar: "https://github.com/shadcn.png",
      type: "task_created",
      description: "created a new task",
      projectId: "1",
      projectName: "Web Development",
      taskId: mockTasks[5].uid,
      taskTitle: mockTasks[5].title,
      createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
    },
    {
      id: generateUniqueId(),
      userId: "1",
      userName: "John Doe",
      userAvatar: "https://github.com/shadcn.png",
      type: "task_updated",
      description: "updated task status",
      projectId: "1",
      projectName: "Web Development",
      taskId: mockTasks[0].uid,
      taskTitle: mockTasks[0].title,
      createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
    },
    {
      id: generateUniqueId(),
      userId: "2",
      userName: "Sarah Smith",
      userAvatar: "https://github.com/shadcn.png",
      type: "project_created",
      description: "created a new project",
      projectId: "prjmob002",
      projectName: "Mobile App",
      createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 8 * 60 * 60 * 1000),
    },
    {
      id: generateUniqueId(),
      userId: "3",
      userName: "Mike Johnson",
      userAvatar: "https://github.com/shadcn.png",
      type: "task_completed",
      description: "completed task",
      projectId: "1",
      projectName: "Web Development",
      taskId: mockTasks[6].uid,
      taskTitle: mockTasks[6].title,
      createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
    },
  ],
  userContributions: [
    {
      userId: "1",
      userName: "John Doe",
      userAvatar: "https://github.com/shadcn.png",
      tasksCompleted: 24,
      tasksCreated: 12,
      commentsAdded: 45,
      totalPoints: 156,
    },
    {
      userId: "2",
      userName: "Sarah Smith",
      userAvatar: "https://github.com/shadcn.png",
      tasksCompleted: 18,
      tasksCreated: 8,
      commentsAdded: 32,
      totalPoints: 118,
    },
    {
      userId: "3",
      userName: "Mike Johnson",
      userAvatar: "https://github.com/shadcn.png",
      tasksCompleted: 15,
      tasksCreated: 10,
      commentsAdded: 28,
      totalPoints: 98,
    },
    {
      userId: "4",
      userName: "Emily Davis",
      userAvatar: "https://github.com/shadcn.png",
      tasksCompleted: 12,
      tasksCreated: 6,
      commentsAdded: 20,
      totalPoints: 74,
    },
    {
      userId: "5",
      userName: "David Wilson",
      userAvatar: "https://github.com/shadcn.png",
      tasksCompleted: 10,
      tasksCreated: 5,
      commentsAdded: 15,
      totalPoints: 60,
    },
  ],
  projects: [
    {
      id: "1",
      name: "Web Development",
      description: "Main website project",
      status: "active",
      progress: 75,
      taskCount: 45,
      completedTaskCount: 34,
      teamMemberIds: ["1", "2", "3"],
      color: "#3b82f6",
      createdAt: twoWeeksAgo,
      updatedAt: now,
    },
    {
      id: "2",
      name: "Mobile App",
      description: "iOS and Android application",
      status: "active",
      progress: 60,
      taskCount: 38,
      completedTaskCount: 23,
      teamMemberIds: ["2", "3", "4"],
      color: "#8b5cf6",
      createdAt: lastWeek,
      updatedAt: now,
    },
    {
      id: "3",
      name: "API Backend",
      description: "RESTful API development",
      status: "active",
      progress: 85,
      taskCount: 28,
      completedTaskCount: 24,
      teamMemberIds: ["1", "3", "5"],
      color: "#10b981",
      createdAt: twoWeeksAgo,
      updatedAt: now,
    },
  ],
  sprints: [
    {
      id: "1",
      name: "Sprint 1",
      projectId: "1",
      startDate: lastWeek,
      endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      status: "active",
      goal: "Complete authentication and core features",
      taskCount: 15,
      completedTaskCount: 10,
      createdAt: lastWeek,
      updatedAt: now,
    },
    {
      id: "2",
      name: "Sprint 2",
      projectId: "prjmob002",
      startDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000),
      status: "active",
      goal: "UI/UX improvements",
      taskCount: 12,
      completedTaskCount: 5,
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: now,
    },
  ],
  teamMembers: [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      avatar: "https://github.com/shadcn.png",
      role: "Senior Developer",
      status: "active",
      taskCount: 8,
      createdAt: twoWeeksAgo,
      updatedAt: now,
    },
    {
      id: "2",
      name: "Sarah Smith",
      email: "sarah@example.com",
      avatar: "https://github.com/shadcn.png",
      role: "Product Manager",
      status: "active",
      taskCount: 5,
      createdAt: twoWeeksAgo,
      updatedAt: now,
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@example.com",
      avatar: "https://github.com/shadcn.png",
      role: "Designer",
      status: "active",
      taskCount: 6,
      createdAt: twoWeeksAgo,
      updatedAt: now,
    },
  ],
};

