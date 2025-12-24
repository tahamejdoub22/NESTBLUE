import { BaseEntity } from "./base.interface";

export interface Notification extends BaseEntity {
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  icon?: string;
  projectId?: string;
  taskId?: string;
}

export type NotificationType = 
  | "info" 
  | "success" 
  | "warning" 
  | "error" 
  | "task" 
  | "project" 
  | "budget" 
  | "cost" 
  | "expense";

