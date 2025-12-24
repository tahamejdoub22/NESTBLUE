export type TaskStatus = "todo" | "in-progress" | "complete" | "backlog";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: Date;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface Task {
  uid: string; // Backend ID (will come from backend later, using constant for now)
  identifier: string; // Unique alphabetic identifier (e.g., "ft5gsgs")
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId?: string; // Link to project (project.uid)
  sprintId?: string; // Link to sprint (sprint.id)
  assignees: string[];
  dueDate?: Date;
  startDate?: Date; // For Gantt chart
  subtasks?: { id: string; title: string; completed: boolean }[];
  comments?: Comment[];
  attachments: Attachment[] | number; // Can be array of attachments or count (for backward compatibility)
  estimatedCost?: {
    amount: number;
    currency: "USD" | "EUR" | "GBP" | "MAD";
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TaskColumn {
  id: TaskStatus;
  title: string;
  color: string;
  tasks: Task[];
}

