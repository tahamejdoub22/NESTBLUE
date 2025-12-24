// src/components/molecules/sprint-table-view.tsx
"use client";

import { useState } from "react";
import { Text } from "@/components/atoms/text";
import { Avatar } from "@/components/atoms/avatar";
import { Badge } from "@/components/atoms/badge";
import { Card } from "@/components/atoms/card";
import { MessageSquare, Eye, Trash2 } from "lucide-react";
import { SprintTask } from "@/components/organisms/sprint-board";
import { Task, TaskStatus, TaskPriority } from "@/interfaces/task.interface";
import { AvatarSelectGroup, User } from "@/components/molecules/avatar-select-group";
import { PrioritySelect } from "@/components/molecules/priority-select";
import { StatusSelect } from "@/components/molecules/status-select";
import { DatePicker } from "@/components/molecules/date-picker";
import { Modal } from "@/components/molecules/modal";
import { TaskDetailModal } from "@/components/molecules/task-detail-modal";

interface SprintTableViewProps {
  tasks?: SprintTask[]; // may be undefined while data is loading
  availableUsers?: User[];
  onTaskUpdate?: (tasks: SprintTask[]) => void;
  onTaskStatusChange?: (taskId: string, status: string) => Promise<void>;
  onTaskPriorityChange?: (taskId: string, priority: string) => Promise<void>;
  onTaskAssigneesChange?: (taskId: string, userIds: string[]) => Promise<void>;
  onTaskDateChange?: (taskId: string, date: Date | undefined) => Promise<void>;
  onTaskDelete?: (taskId: string) => Promise<void>;
  projectId?: string;
  minDate?: Date;
  maxDate?: Date;
}

// Helper function to get comment count (handles both number and array formats)
const getCommentCount = (task: Task): number => {
  if (Array.isArray(task.comments)) {
    return task.comments.length;
  }
  return typeof task.comments === 'number' ? task.comments : 0;
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "low": return "bg-gray-100 text-gray-700 border-gray-200";
    case "medium": return "bg-blue-100 text-blue-700 border-blue-200";
    case "high": return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "urgent": return "bg-red-100 text-red-700 border-red-200";
    default: return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

export function SprintTableView({
  tasks,
  availableUsers = [],
  onTaskUpdate,
  onTaskStatusChange,
  onTaskPriorityChange,
  onTaskAssigneesChange,
  onTaskDateChange,
  onTaskDelete,
  projectId,
  minDate,
  maxDate,
}: SprintTableViewProps) {
  const safeTasks = tasks ?? [];
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<SprintTask | null>(null);

  const handleRowClick = (task: SprintTask) => {
    setSelectedTaskForModal(task);
  };

  return (
    <>
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50 dark:bg-gray-900">
              <th className="px-4 py-3 text-left">
                <Text variant="caption" weight="medium">Name</Text>
              </th>
              <th className="px-4 py-3 text-left">
                <Text variant="caption" weight="medium">Assignee</Text>
              </th>
              <th className="px-4 py-3 text-left">
                <Text variant="caption" weight="medium">Due Date</Text>
              </th>
              <th className="px-4 py-3 text-left">
                <Text variant="caption" weight="medium">Priority</Text>
              </th>
              <th className="px-4 py-3 text-left">
                <Text variant="caption" weight="medium">Status</Text>
              </th>
              <th className="px-4 py-3 text-left">
                <Text variant="caption" weight="medium">Comments</Text>
              </th>
              <th className="px-4 py-3 text-right">
                <Text variant="caption" weight="medium">Actions</Text>
              </th>
            </tr>
          </thead>
          <tbody>
            {safeTasks.map((task, taskIndex) => {
              // Map task assignees to user IDs like board/list
              let selectedUserIds: string[] = [];
              const assignees = task.assignees || [];
              const assigneeIds = (task as any).assigneeIds || [];

              if (Array.isArray(assigneeIds) && assigneeIds.length > 0) {
                selectedUserIds = assigneeIds.filter((id: string) =>
                  availableUsers.some((u) => u.id === id)
                );
              } else if (Array.isArray(assignees) && assignees.length > 0) {
                selectedUserIds = availableUsers
                  .filter((u) => assignees.includes(u.name || u.email))
                  .map((u) => u.id);
              }
              const dueDate =
                task.dueDate
                  ? (task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate))
                  : null;

              const taskId = task.uid || task.identifier;

              return (
              <tr
                key={`table-${task.identifier}-${taskIndex}`}
                className="border-b hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                <td className="px-4 py-3">
                  <Text variant="body" weight="medium">{task.title}</Text>
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <AvatarSelectGroup
                    users={availableUsers}
                    selectedUserIds={selectedUserIds}
                    onSelectionChange={async (userIds) => {
                      await onTaskAssigneesChange?.(taskId, userIds);
                    }}
                    placeholder="Unassigned"
                    allowMultiple={true}
                  />
                </td>
                <td className="px-4 py-3">
                  {dueDate && !isNaN(dueDate.getTime()) ? (
                    <Text variant="body">
                      {dueDate.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </Text>
                  ) : (
                    <Text variant="body" color="muted">-</Text>
                  )}
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <PrioritySelect
                    value={task.priority as TaskPriority}
                    onChange={async (priority) => {
                      await onTaskPriorityChange?.(taskId, priority);
                    }}
                  />
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <StatusSelect
                    value={task.status as TaskStatus}
                    onChange={async (status) => {
                      await onTaskStatusChange?.(taskId, status);
                    }}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                    <Text variant="body">{getCommentCount(task)}</Text>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end items-center gap-2">
                    {/* Open detail modal */}
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent hover:border-border hover:bg-muted/40 transition-colors"
                      onClick={() => handleRowClick(task)}
                    >
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </button>
                    {/* Delete task */}
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent hover:border-destructive/40 hover:bg-destructive/10 transition-colors"
                      onClick={async () => {
                        if (!onTaskDelete) return;
                        await onTaskDelete(taskId);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </Card>

    {selectedTaskForModal && (
      <Modal.Provider defaultOpen={true} onOpenChange={(open) => !open && setSelectedTaskForModal(null)}>
        <TaskDetailModal
          task={selectedTaskForModal}
          availableUsers={availableUsers}
          onTaskUpdate={(updatedTask) => {
            if (!onTaskUpdate || !tasks) return;
            const updatedTasks = tasks.map((t) =>
              (t.uid && t.uid === updatedTask.uid) || t.identifier === updatedTask.identifier
                ? updatedTask
                : t
            );
            onTaskUpdate(updatedTasks);
          }}
          onTaskDelete={onTaskDelete}
          onBackendUpdate={async (taskId, data) => {
            try {
              const { taskApi } = await import("@/core/services/api-helpers");

              const payload: any = { ...data };
              delete payload.assignees;
              delete payload.comments;
              delete payload.subtasks;

              await taskApi.update(taskId, payload);

              if (data.status && onTaskStatusChange) {
                await onTaskStatusChange(taskId, data.status as string);
              } else if (data.priority && onTaskPriorityChange) {
                await onTaskPriorityChange(taskId, data.priority as string);
              } else if (data.assigneeIds && onTaskAssigneesChange) {
                await onTaskAssigneesChange(taskId, data.assigneeIds as string[]);
              } else if (data.dueDate !== undefined && onTaskDateChange) {
                const date =
                  typeof data.dueDate === "string" ? new Date(data.dueDate) : data.dueDate;
                await onTaskDateChange(taskId, date);
              } else if (data.startDate !== undefined && onTaskDateChange) {
                const date =
                  typeof data.startDate === "string" ? new Date(data.startDate) : data.startDate;
                await onTaskDateChange(taskId, date);
              }
            } catch (error) {
              console.error("[SprintTableView] onBackendUpdate ERROR", error);
            }
          }}
          onBackendDelete={onTaskDelete}
        />
      </Modal.Provider>
    )}
    </>
  );
}