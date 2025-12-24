"use client";

import { renderTaskListItem } from "@/template/component/molecules/task-list-item.template";

export interface TaskListItemProps {
  task: import("@/interfaces/task.interface").Task;
  showProject?: boolean;
  projectName?: string;
  className?: string;
  onClick?: () => void;
  availableUsers?: Array<{
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    role?: string;
    status?: "online" | "offline" | "away" | "busy";
  }>;
}

export function TaskListItem(props: TaskListItemProps) {
  return renderTaskListItem(props);
}

