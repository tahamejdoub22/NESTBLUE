import { Notification, NotificationType } from "@/interfaces";
import { generateUniqueId } from "@/lib/utils";

const now = new Date();
const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

export const mockNotifications: Notification[] = [
  {
    id: generateUniqueId(),
    title: "Budget Alert",
    message: "Your 'Marketing Campaign' budget has exceeded 90% of its limit",
    type: "warning",
    read: false,
    actionUrl: "/budgets",
    actionLabel: "View Budget",
    projectId: "prjweb001",
    createdAt: oneHourAgo,
    updatedAt: oneHourAgo,
  },
  {
    id: generateUniqueId(),
    title: "Task Completed",
    message: "Sarah Smith completed the task 'Implement user authentication'",
    type: "success",
    read: false,
    actionUrl: "/projects/prjweb001",
    actionLabel: "View Task",
    taskId: "task-001",
    createdAt: threeHoursAgo,
    updatedAt: threeHoursAgo,
  },
  {
    id: generateUniqueId(),
    title: "New Cost Added",
    message: "A new cost of $1,250 was added to 'Web Development' project",
    type: "cost",
    read: false,
    actionUrl: "/costs",
    actionLabel: "View Cost",
    projectId: "prjweb001",
    createdAt: yesterday,
    updatedAt: yesterday,
  },
  {
    id: generateUniqueId(),
    title: "Project Update",
    message: "The 'Mobile App' project deadline has been updated",
    type: "project",
    read: true,
    actionUrl: "/projects",
    actionLabel: "View Project",
    projectId: "prjmob001",
    createdAt: yesterday,
    updatedAt: yesterday,
  },
  {
    id: generateUniqueId(),
    title: "Expense Reminder",
    message: "Your monthly 'Internet Bill' expense is due in 3 days",
    type: "expense",
    read: false,
    actionUrl: "/expenses",
    actionLabel: "View Expense",
    createdAt: twoDaysAgo,
    updatedAt: twoDaysAgo,
  },
  {
    id: generateUniqueId(),
    title: "Task Assigned",
    message: "You have been assigned to 'Design landing page' task",
    type: "task",
    read: true,
    actionUrl: "/projects/prjweb001",
    actionLabel: "View Task",
    taskId: "task-002",
    createdAt: twoDaysAgo,
    updatedAt: twoDaysAgo,
  },
  {
    id: generateUniqueId(),
    title: "Budget Created",
    message: "A new budget 'Q4 Marketing' has been created",
    type: "budget",
    read: true,
    actionUrl: "/budgets",
    actionLabel: "View Budget",
    createdAt: twoDaysAgo,
    updatedAt: twoDaysAgo,
  },
];

export const getUnreadNotificationCount = (notifications: Notification[]): number => {
  return notifications.filter((n) => !n.read).length;
};

