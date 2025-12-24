// src/components/molecules/sprint-board-view.tsx
"use client";

import { Button } from "@/components/atoms/button";
import { Text } from "@/components/atoms/text";
import { Badge } from "@/components/atoms/badge";
import { Card } from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";
import { Icon } from "@/components/atoms/icon";
import { Calendar, Plus, MoreVertical, Eye, Trash2, Edit, Loader2 } from "lucide-react";
import { Task, TaskStatus, TaskPriority } from "@/interfaces/task.interface";
import { useState, useRef, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

// Legacy type alias for backward compatibility
type SprintTask = Task;
import { cn, generateUniqueId } from "@/lib/utils";
import { TASK_DEFAULTS, DEFAULT_AVAILABLE_USERS } from "@/constants/sprint.constants";
import { User } from "@/components/molecules/avatar-select-group";
import { AvatarSelectGroup } from "@/components/molecules/avatar-select-group";
import { PrioritySelect } from "@/components/molecules/priority-select";
import { DatePicker } from "@/components/molecules/date-picker";
import { Modal } from "@/components/molecules/modal";
import { TaskDetailModal } from "@/components/molecules/task-detail-modal";
import { Dropdown } from "@/components/molecules/dropdown";
import { useSprint } from "@/hooks/use-sprints";
import { toast } from "sonner";
import { useMemo } from "react";

interface SprintColumnProps {
  id: TaskStatus;
  title: string;
  color: string;
  tasks: SprintTask[];
  onAddTask: (columnId: TaskStatus) => void;
}

interface SprintBoardViewProps {
  columns: SprintColumnProps[];
  onAddTask: (task: Omit<SprintTask, "id"> | TaskStatus) => void;
  onDragEnd: (taskId: string, newStatus: TaskStatus) => void | Promise<void>;
  onTaskUpdate?: (tasks: SprintTask[]) => void;
  availableUsers?: User[];
  tasks: SprintTask[];
  minDate?: Date;
  maxDate?: Date;
  onTaskStatusChange?: (taskId: string, status: string) => Promise<void>;
  onTaskPriorityChange?: (taskId: string, priority: string) => Promise<void>;
  onTaskAssigneesChange?: (taskId: string, userIds: string[]) => Promise<void>;
  onTaskDateChange?: (taskId: string, date: Date | undefined) => Promise<void>;
  onTaskDelete?: (taskId: string) => Promise<void>;
  projectId?: string;
  sprintId?: string;
}

interface DraggableTaskCardProps {
  task: SprintTask;
  columnId: TaskStatus;
  taskIndex: number;
  isDragging: boolean;
  isUpdating?: boolean;
  onDragStart: (taskId: string) => void;
  onDragEnd: () => void;
  onPriorityChange: (taskId: string, priority: string) => void | Promise<void>;
  onAssigneesChange: (taskId: string, userIds: string[]) => void | Promise<void>;
  onTaskUpdate: (updatedTask: SprintTask) => void;
  onTaskDelete?: (taskId: string) => void | Promise<void>;
  availableUsers: User[];
  getUserIdsFromTask: (task: SprintTask) => string[];
  onBackendUpdate?: (taskId: string, data: Partial<Task> & { assigneeIds?: string[] }) => Promise<void>;
  onBackendDelete?: (taskId: string) => Promise<void>;
  onTaskRefresh?: (taskId: string) => Promise<Task | void>;
  minDate?: Date;
  maxDate?: Date;
  projectId?: string;
  sprintId?: string;
  isUpdating?: boolean;
}

function DraggableTaskCard({
  task,
  columnId,
  taskIndex,
  isDragging,
  isUpdating,
  onDragStart,
  onDragEnd,
  onPriorityChange,
  onAssigneesChange,
  onTaskUpdate,
  onTaskDelete,
  availableUsers,
  getUserIdsFromTask,
  onBackendUpdate,
  onBackendDelete,
  onTaskRefresh,
  minDate,
  maxDate,
  projectId,
  sprintId,
}: DraggableTaskCardProps) {
  const queryClient = useQueryClient();
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Get sprint data if sprintId is provided
  const { sprint: currentSprint } = useSprint(sprintId || "");

  // Normalize date to midnight (remove time component) for proper comparison
  const normalizeDate = useCallback((date: Date | string | undefined): Date | undefined => {
    if (!date) return undefined;
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return undefined;
    const normalized = new Date(d);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }, []);

  // Calculate effective min/max dates based on sprint or project
  const effectiveMinDate = useMemo(() => {
    if (sprintId && currentSprint?.startDate) {
      return normalizeDate(currentSprint.startDate);
    }
    return normalizeDate(minDate);
  }, [sprintId, currentSprint?.startDate, minDate, normalizeDate]);

  const effectiveMaxDate = useMemo(() => {
    if (sprintId && currentSprint?.endDate) {
      return normalizeDate(currentSprint.endDate);
    }
    return normalizeDate(maxDate);
  }, [sprintId, currentSprint?.endDate, maxDate, normalizeDate]);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open modal if clicking on interactive elements
    if (
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('[role="button"]') ||
      (e.target as HTMLElement).closest('input') ||
      (e.target as HTMLElement).closest('select')
    ) {
      return;
    }
    setIsDetailModalOpen(true);
  };

  return (
    <>
      <Card
        key={`board-${columnId}-task-${task.identifier}-${taskIndex}`}
        className={cn(
          "relative cursor-grab p-4 hover:shadow-xl active:cursor-grabbing transition-all duration-300 group",
          "border border-border/60 hover:border-primary/40 bg-card backdrop-blur-sm",
          "hover:scale-[1.01] active:scale-[0.99] hover:-translate-y-0.5",
          "rounded-xl shadow-sm hover:shadow-md",
          isDragging ? 'opacity-40 scale-95 shadow-2xl border-primary/50' : 'opacity-100'
        )}
        draggable
        onClick={handleCardClick}
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "move";
          // Use uid if available (backend), otherwise use identifier (legacy)
          const taskId = task.uid || task.identifier;
          e.dataTransfer.setData("taskIdentifier", taskId);
          e.dataTransfer.setData("sourceColumn", columnId);
          onDragStart(taskId);
        }}
        onDragEnd={onDragEnd}
      >
        <div className="space-y-3">
        {/* Task Header with Actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1">
            <Text variant="body" weight="semibold" className="line-clamp-2 text-[15px] leading-tight text-foreground group-hover:text-primary transition-colors">
              {task.title}
            </Text>
            {task.description && (
              <Text variant="caption" color="muted" className="line-clamp-2 text-xs leading-relaxed mt-1">
                {task.description}
              </Text>
            )}
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <Dropdown
              items={[
                {
                  value: "view",
                  label: "View Details",
                  icon: <Icon icon={Eye} size="sm" />,
                },
                {
                  value: "edit",
                  label: "Edit Task",
                  icon: <Icon icon={Edit} size="sm" />,
                },
                {
                  value: "delete",
                  label: "Delete",
                  icon: <Icon icon={Trash2} size="sm" color="destructive" />,
                },
              ]}
              onSelect={(value) => {
                if (value === "view" || value === "edit") {
                  setIsDetailModalOpen(true);
                } else if (value === "delete" && onTaskDelete) {
                  onTaskDelete(task.identifier);
                }
              }}
              trigger={
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-shrink-0 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent/50"
                >
                  <Icon icon={MoreVertical} size="sm" />
                </Button>
              }
              align="right"
              className="w-auto"
              contentClassName="w-48"
            />
          </div>
        </div>

        {/* Priority Badge */}
        <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
          <PrioritySelect
            value={task.priority}
            onChange={(value) => onPriorityChange(task.identifier, value)}
            size="sm"
          />
        </div>

        {/* Subtasks progress */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5 flex-1 h-1.5 rounded-full overflow-hidden bg-muted/50">
                {task.subtasks.map((subtask, idx) => (
                  <div
                    key={`board-${task.identifier}-subtask-${idx}`}
                    className={cn(
                      "flex-1 transition-all",
                      subtask.completed 
                        ? 'bg-green-500 dark:bg-green-400' 
                        : 'bg-muted'
                    )}
                  />
                ))}
              </div>
              <Text variant="caption" color="muted" className="text-[10px] font-medium min-w-[28px] text-right">
                {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
              </Text>
            </div>
          </div>
        )}

        {/* Task footer with Assignee and Due Date */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/40">
          {/* Assignee Selector */}
          <div onClick={(e) => e.stopPropagation()} className="flex items-center min-w-0 flex-shrink">
            <AvatarSelectGroup
              users={availableUsers}
              selectedUserIds={getUserIdsFromTask(task)}
              onSelectionChange={(userIds) => onAssigneesChange(task.uid || task.identifier, userIds)}
              placeholder="Unassigned"
              allowMultiple={true}
              size="xs"
            />
          </div>

          {/* Due Date - Improved Design */}
          {task.dueDate && (() => {
            const dueDate = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
            if (isNaN(dueDate.getTime())) return null;

            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const dueDateNormalized = new Date(dueDate);
            dueDateNormalized.setHours(0, 0, 0, 0);
            const isOverdue = dueDateNormalized < now && task.status !== 'complete';
            const isDueSoon = dueDateNormalized.getTime() - now.getTime() <= 3 * 24 * 60 * 60 * 1000 && dueDateNormalized >= now;

            // Display as "26 Jan 2026"
            const day = String(dueDate.getDate()).padStart(2, "0");
            const month = dueDate.toLocaleString("en-US", { month: "short" });
            const year = dueDate.getFullYear();

            return (
              <div 
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] transition-colors flex-shrink-0",
                  isOverdue 
                    ? "bg-destructive/10 text-destructive border border-destructive/20" 
                    : isDueSoon
                    ? "bg-warning/10 text-warning-600 dark:text-warning-400 border border-warning/20"
                    : "bg-muted/50 text-muted-foreground border border-border/40"
                )}
              >
                <Calendar className={cn(
                  "h-3 w-3",
                  isOverdue && "text-destructive",
                  isDueSoon && "text-warning-600"
                )} />
                <span className="font-bold whitespace-nowrap">
                  {`${day} ${month} ${year}`}
                </span>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Per-card saving overlay */}
      {isUpdating && (
        <div className="absolute inset-0 rounded-xl bg-background/80 backdrop-blur-sm flex items-center justify-center z-20 animate-in fade-in-0 duration-200">
          <div className="flex flex-col items-center gap-2.5 px-4 py-3 rounded-lg bg-card/95 border border-border/50 shadow-lg">
            <div className="relative">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div className="absolute inset-0 h-5 w-5 animate-spin text-primary/20">
                <Loader2 className="h-5 w-5" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              </div>
            </div>
            <span className="text-xs font-medium text-foreground">Saving changes...</span>
          </div>
        </div>
      )}
    </Card>

    {/* Task Detail Modal */}
    {isDetailModalOpen && (
      <Modal.Provider defaultOpen={true} onOpenChange={setIsDetailModalOpen}>
        <TaskDetailModal
          task={task}
          availableUsers={availableUsers}
          onTaskUpdate={onTaskUpdate}
          onTaskDelete={onTaskDelete}
          onBackendUpdate={onBackendUpdate}
          onBackendDelete={onBackendDelete}
          onTaskRefresh={async (taskId: string) => {
            // Invalidate React Query cache to force refresh
            if (projectId) {
              await queryClient.invalidateQueries({ queryKey: ["tasks", "project", projectId] });
            }
            await queryClient.invalidateQueries({ queryKey: ["tasks"] });
            
            // Refresh task from backend
            const { taskApi } = await import("@/core/services/api-helpers");
            const refreshedTask = await taskApi.getByUid(taskId);
            
            // Update the task in the list using onTaskUpdate (which is handleTaskUpdate from parent)
            onTaskUpdate(refreshedTask);
            return refreshedTask;
          }}
              minDate={effectiveMinDate}
              maxDate={effectiveMaxDate}
            />
          </Modal.Provider>
        )}
  </>
  );
}

export function SprintBoardView({
  columns,
  onAddTask,
  onDragEnd,
  onTaskUpdate,
  availableUsers = DEFAULT_AVAILABLE_USERS,
  tasks,
  minDate,
  maxDate,
  onTaskStatusChange,
  onTaskPriorityChange,
  onTaskAssigneesChange,
  onTaskDateChange,
  onTaskDelete,
  projectId,
  sprintId,
}: SprintBoardViewProps) {
  const queryClient = useQueryClient();
  const [draggedOver, setDraggedOver] = useState<TaskStatus | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [updatingField, setUpdatingField] = useState<string | null>(null);
  const [addingTaskColumnId, setAddingTaskColumnId] = useState<TaskStatus | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | undefined>(undefined);
  const newTaskInputRef = useRef<HTMLInputElement>(null);

  // Get sprint data if sprintId is provided
  const { sprint: currentSprint } = useSprint(sprintId || "");

  // Normalize date to midnight (remove time component) for proper comparison
  const normalizeDate = useCallback((date: Date | string | undefined): Date | undefined => {
    if (!date) return undefined;
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return undefined;
    const normalized = new Date(d);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }, []);

  // Calculate effective min/max dates based on sprint or project
  const effectiveMinDate = useMemo(() => {
    if (sprintId && currentSprint?.startDate) {
      return normalizeDate(currentSprint.startDate);
    }
    return normalizeDate(minDate);
  }, [sprintId, currentSprint?.startDate, minDate, normalizeDate]);

  const effectiveMaxDate = useMemo(() => {
    if (sprintId && currentSprint?.endDate) {
      return normalizeDate(currentSprint.endDate);
    }
    return normalizeDate(maxDate);
  }, [sprintId, currentSprint?.endDate, maxDate, normalizeDate]);

  // Focus input when adding task
  useEffect(() => {
    if (addingTaskColumnId && newTaskInputRef.current) {
      newTaskInputRef.current.focus();
    }
  }, [addingTaskColumnId]);

  // Helper function to get user IDs from task assignees
  const getUserIdsFromTask = useCallback(
    (task: SprintTask): string[] => {
      // Handle both assignees (array of names) and assigneeIds (array of IDs)
      const assignees = task.assignees || [];
      const assigneeIds = (task as any).assigneeIds || [];
      
      // If assigneeIds exist, use them directly
      if (assigneeIds.length > 0 && Array.isArray(assigneeIds)) {
        return assigneeIds.filter((id: string) => 
          availableUsers.some((user) => user.id === id)
        );
      }
      
      // Otherwise, match by name
      if (Array.isArray(assignees) && assignees.length > 0) {
        return availableUsers
          .filter((user) => assignees.includes(user.name || user.email))
          .map((user) => user.id);
      }
      
      return [];
    },
    [availableUsers]
  );

  // Handle full task update from detail modal (defined early so other handlers can use it)
  const handleTaskUpdate = useCallback((updatedTask: SprintTask) => {
    if (!onTaskUpdate) return;
    const updatedTasks = tasks.map((task: SprintTask) => {
      // Match by both uid and identifier to be safe
      if ((task.uid && task.uid === updatedTask.uid) || 
          (task.identifier === updatedTask.identifier)) {
        return updatedTask;
      }
      return task;
    });
    onTaskUpdate(updatedTasks);
  }, [tasks, onTaskUpdate]);

  // Handle task priority change
  const handleTaskPriorityChange = useCallback(async (taskIdentifier: string, priority: string) => {
    const task = tasks.find(t => t.identifier === taskIdentifier || t.uid === taskIdentifier);
    if (!task) return;
    
    if (onTaskPriorityChange && task.uid) {
      // Use backend API
      setUpdatingTaskId(task.uid);
      setUpdatingField('priority');
      try {
        await onTaskPriorityChange(task.uid, priority);
        toast.success("Task priority updated");
        // Refresh task from backend to get updated data
        const { taskApi } = await import("@/core/services/api-helpers");
        const refreshedTask = await taskApi.getByUid(task.uid);
        handleTaskUpdate(refreshedTask);
      } catch (error) {
        console.error("Failed to update task priority:", error);
        toast.error("Failed to update task priority");
      } finally {
        setUpdatingTaskId(null);
        setUpdatingField(null);
      }
    } else if (onTaskUpdate) {
      // Fallback to local state
      const updatedTasks = tasks.map((task: SprintTask) => {
        if (task.identifier === taskIdentifier || task.uid === taskIdentifier) {
          return { ...task, priority: priority as TaskPriority };
        }
        return task;
      });
      onTaskUpdate(updatedTasks);
    }
  }, [tasks, onTaskUpdate, onTaskPriorityChange, handleTaskUpdate]);

  // Handle task assignees change
  const handleTaskAssigneesChange = useCallback(async (taskIdentifier: string, userIds: string[]) => {
    const task = tasks.find(t => t.identifier === taskIdentifier || t.uid === taskIdentifier);
    if (!task) return;
    
    if (onTaskAssigneesChange && task.uid) {
      // Use backend API
      setUpdatingTaskId(task.uid);
      setUpdatingField('assignees');
      try {
        await onTaskAssigneesChange(task.uid, userIds);
        toast.success("Task assignees updated");
        // Refresh task from backend to get updated data
        const { taskApi } = await import("@/core/services/api-helpers");
        const refreshedTask = await taskApi.getByUid(task.uid);
        handleTaskUpdate(refreshedTask);
      } catch (error) {
        console.error("Failed to update task assignees:", error);
        toast.error("Failed to update task assignees");
      } finally {
        setUpdatingTaskId(null);
        setUpdatingField(null);
      }
    } else if (onTaskUpdate) {
      // Fallback to local state
      const selectedUsers = availableUsers.filter((user) => userIds.includes(user.id));
      const updatedTasks = tasks.map((task: SprintTask) => {
        if (task.identifier === taskIdentifier || task.uid === taskIdentifier) {
          return { 
            ...task, 
            assignees: selectedUsers.map((user) => user.name || user.email),
            assigneeIds: userIds,
          };
        }
        return task;
      });
      onTaskUpdate(updatedTasks);
    }
  }, [tasks, onTaskUpdate, availableUsers, onTaskAssigneesChange, handleTaskUpdate]);

  // Handle task delete
  const handleTaskDelete = useCallback((taskId: string) => {
    if (!onTaskUpdate) return;
    const updatedTasks = tasks.filter((task: SprintTask) => task.identifier !== taskId);
    onTaskUpdate(updatedTasks);
  }, [tasks, onTaskUpdate]);

  const handleDragStart = (taskId: string) => {
    setDraggingTaskId(taskId);
  };

  const handleDragEndInternal = () => {
    setDraggingTaskId(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, columnId: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDraggedOver(columnId);
  };

  const handleDragLeave = () => {
    setDraggedOver(null);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, targetColumnId: TaskStatus) => {
    e.preventDefault();
    const taskIdentifier = e.dataTransfer.getData("taskIdentifier");
    const sourceColumn = e.dataTransfer.getData("sourceColumn") as TaskStatus;

    if (sourceColumn !== targetColumnId && taskIdentifier) {
      setUpdatingTaskId(taskIdentifier);
      setUpdatingField('status');
      try {
        await onDragEnd(taskIdentifier, targetColumnId);
        toast.success("Task moved successfully");
      } catch (error: any) {
        console.error("Drag and drop error:", error);
        toast.error(error?.message || "Failed to move task");
      } finally {
        setUpdatingTaskId(null);
        setUpdatingField(null);
      }
    }

    setDraggedOver(null);
    setDraggingTaskId(null);
  };

  const startAddingTask = (columnId: TaskStatus) => {
    setAddingTaskColumnId(columnId);
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskDueDate(undefined);
  };

  const cancelAddingTask = () => {
    setAddingTaskColumnId(null);
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskDueDate(undefined);
  };

  const saveNewTask = (columnId: TaskStatus) => {
    if (!newTaskTitle.trim()) {
      cancelAddingTask();
      return;
    }

    const newTask: Omit<SprintTask, "id"> = {
      uid: generateUniqueId(),
      identifier: generateUniqueId().substring(0, 7),
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim() || undefined,
      assignees: [],
      priority: TASK_DEFAULTS.priority,
      status: columnId,
      subtasks: [],
      dueDate: newTaskDueDate,
      comments: [],
      attachments: TASK_DEFAULTS.attachments,
    };

    onAddTask(newTask);
    cancelAddingTask();
  };

  const handleKeyPress = (e: React.KeyboardEvent, columnId: TaskStatus) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveNewTask(columnId);
    } else if (e.key === "Escape") {
      cancelAddingTask();
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-4 relative">
      {columns.map((column) => {
        const isAddingTask = addingTaskColumnId === column.id;
        const isDraggedOver = draggedOver === column.id;

        return (
          <div
            key={column.id}
            className="space-y-4 relative"
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column-level drag and drop loading indicator */}
            {isDraggedOver && draggingTaskId && updatingTaskId === draggingTaskId && updatingField === 'status' && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 animate-in fade-in-0 slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/95 border border-primary shadow-xl backdrop-blur-sm">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary-foreground" />
                  <span className="text-xs font-medium text-primary-foreground">Moving task...</span>
                </div>
              </div>
            )}
            {/* Column Header */}
            <div className="flex items-center justify-between px-1 pb-2">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  column.color
                )} />
                <div className="flex items-center gap-2">
                  <Text variant="h6" weight="semibold" className="text-sm uppercase tracking-wide">
                    {column.title}
                  </Text>
                  <Badge 
                    variant="secondary" 
                    className="ml-1 h-5 min-w-5 px-1.5 text-xs font-semibold bg-muted/70 border-border/50"
                  >
                    {column.tasks.length}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => startAddingTask(column.id)}
                className="h-7 w-7 p-0 opacity-60 hover:opacity-100 hover:bg-accent/50 transition-all"
              >
                <Icon icon={Plus} size="sm" />
              </Button>
            </div>

            {/* Tasks in Column - Drop Zone */}
            <div
              className={cn(
                "space-y-3 min-h-[300px] rounded-xl p-3 transition-all duration-200",
                "bg-muted/20 border-2 border-dashed border-transparent",
                isDraggedOver && 'bg-primary/5 border-primary/30 border-solid shadow-lg scale-[1.02]'
              )}
            >
              {column.tasks.map((task, taskIndex) => (
                <DraggableTaskCard
                  key={`board-${column.id}-task-${task.identifier}-${taskIndex}`}
                  task={task}
                  columnId={column.id}
                  taskIndex={taskIndex}
                  isDragging={draggingTaskId === task.identifier}
                  isUpdating={updatingTaskId === (task.uid || task.identifier)}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEndInternal}
                  onPriorityChange={handleTaskPriorityChange}
                  onAssigneesChange={handleTaskAssigneesChange}
                  onTaskUpdate={handleTaskUpdate}
                  onTaskDelete={handleTaskDelete}
                  availableUsers={availableUsers}
                  getUserIdsFromTask={getUserIdsFromTask}
                  minDate={minDate}
                  maxDate={maxDate}
                  sprintId={sprintId}
                  onBackendUpdate={async (taskId: string, data: Partial<Task> & { assigneeIds?: string[] }) => {
                    try {
                      setUpdatingTaskId(taskId);
                      const { taskApi } = await import("@/core/services/api-helpers");
                      
                      // Prepare payload for backend: use assigneeIds only, strip view-only fields
                      const payload: any = { ...data };
                      delete payload.assignees;      // backend only knows assigneeIds
                      delete payload.comments;      // managed via separate endpoints
                      delete payload.subtasks;      // managed via separate endpoints

                      // Persist ALL changes to backend first (description, assigneeIds, dates, estimatedCost, etc.)
                      await taskApi.update(taskId, payload);

                      // Then run any legacy callbacks for optimistic UI flows (status/priority/assignees/dates)
                      if (data.status && onTaskStatusChange) {
                        await onTaskStatusChange(taskId, data.status as string);
                      } else if (data.priority && onTaskPriorityChange) {
                        await onTaskPriorityChange(taskId, data.priority as string);
                      } else if (data.assigneeIds && onTaskAssigneesChange) {
                        await onTaskAssigneesChange(taskId, data.assigneeIds);
                      } else if (data.dueDate !== undefined && onTaskDateChange) {
                        const date = typeof data.dueDate === "string" ? new Date(data.dueDate) : data.dueDate;
                        await onTaskDateChange(taskId, date);
                      } else if (data.startDate !== undefined && onTaskDateChange) {
                        const date = typeof data.startDate === "string" ? new Date(data.startDate) : data.startDate;
                        await onTaskDateChange(taskId, date);
                      }

                      // Invalidate React Query cache so other views pick up the latest data
                      if (projectId) {
                        await queryClient.invalidateQueries({ queryKey: ["tasks", "project", projectId] });
                      }
                      await queryClient.invalidateQueries({ queryKey: ["tasks"] });

                      // Always fetch updated task from backend to ensure we have the latest data
                      const refreshedTask = await taskApi.getByUid(taskId);

                      // Update the task in the list
                      handleTaskUpdate(refreshedTask);
                    } catch (error) {
                      console.error("Failed to update task:", error);
                    } finally {
                      setUpdatingTaskId((current) => (current === taskId ? null : current));
                    }
                  }}
                  onBackendDelete={onTaskDelete}
                  onTaskRefresh={async (taskId: string) => {
                    // Invalidate React Query cache to force refresh
                    if (projectId) {
                      await queryClient.invalidateQueries({ queryKey: ["tasks", "project", projectId] });
                    }
                    await queryClient.invalidateQueries({ queryKey: ["tasks"] });
                    
                    // Refresh task from backend
                    const { taskApi } = await import("@/core/services/api-helpers");
                    const refreshedTask = await taskApi.getByUid(taskId);
                    
                    // Update the task in the list
                    handleTaskUpdate(refreshedTask);
                    return refreshedTask;
                  }}
                  minDate={minDate}
                  maxDate={maxDate}
                  projectId={projectId}
                  getUserIdsFromTask={getUserIdsFromTask}
                />
              ))}

              {/* Inline Add Task Form */}
              {isAddingTask && (
                <Card
                  className={cn(
                    "border-2 border-primary/30 shadow-lg",
                    "animate-fade-in-up bg-card backdrop-blur-sm",
                    "p-4 space-y-3"
                  )}
                >
                  <Input
                    ref={newTaskInputRef}
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, column.id)}
                    placeholder="Enter task title..."
                    className={cn(
                      "h-10 text-sm font-medium",
                      "border-border/50 bg-background",
                      "focus:border-primary focus:ring-2 focus:ring-primary/20",
                      "placeholder:text-muted-foreground/60"
                    )}
                  />
                  <textarea
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    placeholder="Add description (optional)..."
                    rows={2}
                    className={cn(
                      "w-full px-3 py-2 text-sm rounded-md resize-none",
                      "border border-border/50 bg-background",
                      "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                      "placeholder:text-muted-foreground/60"
                    )}
                  />
                  <div onClick={(e) => e.stopPropagation()}>
                    <DatePicker
                      key={`new-task-date-${sprintId || 'no-sprint'}-${effectiveMinDate?.getTime() || 'no-min'}-${effectiveMaxDate?.getTime() || 'no-max'}`}
                      value={newTaskDueDate ? normalizeDate(newTaskDueDate) : undefined}
                      onChange={(date) => setNewTaskDueDate(date ? normalizeDate(date) : undefined)}
                      placeholder="Set due date (optional)"
                      className="text-sm"
                      minDate={effectiveMinDate}
                      maxDate={effectiveMaxDate}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      size="sm"
                      onClick={() => saveNewTask(column.id)}
                      disabled={!newTaskTitle.trim()}
                      className={cn(
                        "h-9 px-4 gap-2 flex-1 font-medium",
                        "bg-primary hover:bg-primary/90",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      <Icon icon={Plus} size="xs" />
                      Add Task
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelAddingTask}
                      className="h-9 px-4"
                    >
                      Cancel
                    </Button>
                  </div>
                </Card>
              )}
            </div>

            {/* Add Task Button */}
            {!isAddingTask && (
              <Button
                variant="outline"
                fullWidth
                onClick={() => startAddingTask(column.id)}
                className={cn(
                  "mt-2 h-10 border-2 border-dashed border-border/50",
                  "hover:border-primary/50 hover:bg-primary/5 hover:text-primary",
                  "transition-all duration-200 font-medium",
                  "bg-card/50 backdrop-blur-sm"
                )}
              >
                <Icon icon={Plus} size="sm" className="mr-2" />
                Add Task
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}