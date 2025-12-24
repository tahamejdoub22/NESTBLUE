// Advanced SprintListView with Professional UI/UX Design
"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/atoms/button";
import { Text } from "@/components/atoms/text";
import { Input } from "@/components/atoms/input";
import { GlassCard } from "@/components/atoms/glass-card";
import { ProgressBar } from "@/components/atoms/progress-bar";
import { Icon } from "@/components/atoms/icon";
import { User } from "@/components/molecules/avatar-select-group";
import { AvatarSelectGroup } from "@/components/molecules/avatar-select-group";
import { DatePicker } from "@/components/molecules/date-picker";
import { PrioritySelect } from "@/components/molecules/priority-select";
import { StatusSelect } from "@/components/molecules/status-select";
import { Task } from "@/interfaces/task.interface";
import {
  Plus,
  GripVertical,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  ListTodo,
  Layers,
  Trash2,
  Eye,
  MoveRight,
  Check,
} from "lucide-react";
import { cn, generateUniqueId } from "@/lib/utils";
import { Modal } from "@/components/molecules/modal";
import { TaskDetailModal } from "@/components/molecules/task-detail-modal";
import { useSprint } from "@/hooks/use-sprints";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// Legacy type alias for backward compatibility
type SprintTask = Task;
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/atoms";

// Import constants
import {
  STATUS_ORDER,
  STATUS_LABELS,
  STATUS_COLORS,
  DEFAULT_AVAILABLE_USERS,
  UI_TEXT,
  TASK_DEFAULTS,
  KEYBOARD_SHORTCUTS,
  CARD_STYLES,
  TASK_ROW_STYLES,
  STATUS_SECTION_STYLES,
  BUTTON_STYLES,
} from "@/constants/sprint.constants";

interface SprintListViewProps {
  tasks: SprintTask[];
  onAddTask?: (task: Omit<SprintTask, "uid" | "identifier">) => void | Promise<void>;
  onTaskUpdate?: (tasks: SprintTask[]) => void;
  availableUsers?: User[];
  isLoading?: boolean;
  projectId?: string;
  sprintId?: string;
  onTaskStatusChange?: (taskId: string, status: string) => Promise<void>;
  onTaskPriorityChange?: (taskId: string, priority: string) => Promise<void>;
  onTaskAssigneesChange?: (taskId: string, userIds: string[]) => Promise<void>;
  onTaskDateChange?: (taskId: string, date: Date | undefined) => Promise<void>;
  onTaskDelete?: (taskId: string) => Promise<void>;
  minDate?: Date;
  maxDate?: Date;
}

// Status Icon Component
const StatusIcon = ({ status, className }: { status: string; className?: string }) => {
  const icons = {
    todo: Circle,
    "in-progress": Clock,
    complete: CheckCircle2,
  };
  const Icon = icons[status as keyof typeof icons] || Circle;
  return <Icon className={className} />;
};

// Helper function to get comment count (handles both number and array formats)
const getCommentCount = (task: Task): number => {
  if (Array.isArray(task.comments)) {
    return task.comments.length;
  }
  return typeof task.comments === 'number' ? task.comments : 0;
};

// Task Count Badge
const TaskCountBadge = ({ count, status }: { count: number; status: string }) => {
  const colorConfig = STATUS_COLORS[status as keyof typeof STATUS_COLORS];
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full",
      "text-xs font-semibold",
      colorConfig?.badge,
      "border",
      colorConfig?.badgeBorder
    )}>
      <span className={cn("h-1.5 w-1.5 rounded-full", colorConfig?.dot)} />
      {count} {count === 1 ? "task" : "tasks"}
    </div>
  );
};

export function SprintListView({
  tasks,
  onAddTask,
  onTaskUpdate,
  availableUsers = DEFAULT_AVAILABLE_USERS,
  projectId,
  sprintId,
  onTaskStatusChange,
  onTaskPriorityChange,
  onTaskAssigneesChange,
  onTaskDateChange,
  onTaskDelete,
  minDate,
  maxDate,
}: SprintListViewProps) {
  const queryClient = useQueryClient();
  // Get sprint data for date restrictions when in sprint context
  const { sprint: currentSprint } = useSprint(sprintId || "");
  
  // Loading states for individual operations
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [updatingField, setUpdatingField] = useState<string | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  
  // Drag and drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);
  
  // Normalize date to midnight (remove time component) for proper comparison
  const normalizeDate = (date: Date | string | undefined): Date | undefined => {
    if (!date) return undefined;
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return undefined;
    const normalized = new Date(d);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };
  
  // Calculate effective min/max dates based on sprint or project
  const effectiveMinDate = useMemo(() => {
    if (sprintId && currentSprint?.startDate) {
      return normalizeDate(currentSprint.startDate);
    }
    return normalizeDate(minDate);
  }, [sprintId, currentSprint?.startDate, minDate]);
  
  const effectiveMaxDate = useMemo(() => {
    if (sprintId && currentSprint?.endDate) {
      return normalizeDate(currentSprint.endDate);
    }
    return normalizeDate(maxDate);
  }, [sprintId, currentSprint?.endDate, maxDate]);

  // UI state
  const [expandedStatus, setExpandedStatus] = useState<Record<string, boolean>>({
    todo: true,
    "in-progress": true,
    complete: true,
  });

  // Selection state
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

  // Modal state
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<SprintTask | null>(null);

  // New task form state
  const [addingTaskStatus, setAddingTaskStatus] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const newTaskInputRef = useRef<HTMLInputElement>(null);

  // Focus input when adding task
  useEffect(() => {
    if (addingTaskStatus && newTaskInputRef.current) {
      newTaskInputRef.current.focus();
    }
  }, [addingTaskStatus]);

  // Group tasks by status with memoization
  const groupedTasks = useMemo(() => {
    return tasks.reduce((acc: Record<string, SprintTask[]>, task: SprintTask) => {
      if (!acc[task.status]) {
        acc[task.status] = [];
      }
      acc[task.status].push(task);
      return acc;
    }, {} as Record<string, SprintTask[]>);
  }, [tasks]);

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const total = tasks.length;
    if (total === 0) return 0;
    const completed = tasks.filter((t: SprintTask) => t.status === "complete").length;
    return Math.round((completed / total) * 100);
  }, [tasks]);

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

  // Use refs to avoid recreating handlers when tasks change
  const tasksRef = useRef(tasks);
  const onTaskUpdateRef = useRef(onTaskUpdate);

  // Keep refs in sync
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    onTaskUpdateRef.current = onTaskUpdate;
  }, [onTaskUpdate]);

  // Handle inline task updates - use backend API if provided, otherwise local state
  const handleTaskPriorityChange = useCallback(async (taskIdentifier: string, priority: string) => {
    const task = tasksRef.current.find(t => t.identifier === taskIdentifier || t.uid === taskIdentifier);
    if (!task) return;
    
    if (onTaskPriorityChange && task.uid) {
      // Use backend API
      setUpdatingTaskId(task.uid);
      setUpdatingField('priority');
      try {
        await onTaskPriorityChange(task.uid, priority);
        toast.success("Task priority updated");
      } catch (error) {
        console.error("Failed to update task priority:", error);
        toast.error("Failed to update task priority");
      } finally {
        setUpdatingTaskId(null);
        setUpdatingField(null);
      }
    } else {
      // Fallback to local state
      const updatedTasks = tasksRef.current.map((task: SprintTask) => {
        if (task.identifier === taskIdentifier) {
          return { ...task, priority: priority as "low" | "medium" | "high" | "urgent" };
        }
        return task;
      });
      onTaskUpdateRef.current?.(updatedTasks);
    }
  }, [onTaskPriorityChange]);

  const handleTaskStatusChange = useCallback(async (taskIdentifier: string, status: string) => {
    const task = tasksRef.current.find(t => t.identifier === taskIdentifier || t.uid === taskIdentifier);
    if (!task) return;
    
    if (onTaskStatusChange && task.uid) {
      // Use backend API
      setUpdatingTaskId(task.uid);
      setUpdatingField('status');
      try {
        await onTaskStatusChange(task.uid, status);
        toast.success("Task status updated");
      } catch (error) {
        console.error("Failed to update task status:", error);
        toast.error("Failed to update task status");
      } finally {
        setUpdatingTaskId(null);
        setUpdatingField(null);
      }
    } else {
      // Fallback to local state
      const updatedTasks = tasksRef.current.map((task: SprintTask) => {
        if (task.identifier === taskIdentifier) {
          return { ...task, status: status as "todo" | "in-progress" | "complete" };
        }
        return task;
      });
      onTaskUpdateRef.current?.(updatedTasks);
    }
  }, [onTaskStatusChange]);

  const handleTaskAssigneesChange = useCallback(async (taskIdentifier: string, userIds: string[]) => {
    const task = tasksRef.current.find(t => t.identifier === taskIdentifier || t.uid === taskIdentifier);
    if (!task) return;
    
    if (onTaskAssigneesChange && task.uid) {
      // Use backend API
      setUpdatingTaskId(task.uid);
      setUpdatingField('assignees');
      try {
        await onTaskAssigneesChange(task.uid, userIds);
        toast.success("Task assignees updated");
      } catch (error) {
        console.error("Failed to update task assignees:", error);
        toast.error("Failed to update task assignees");
      } finally {
        setUpdatingTaskId(null);
        setUpdatingField(null);
      }
    } else {
      // Fallback to local state
      const selectedUsers = availableUsers.filter((user) => userIds.includes(user.id));
      const updatedTasks = tasksRef.current.map((task: SprintTask) => {
        if (task.identifier === taskIdentifier) {
          return { 
            ...task, 
            assignees: selectedUsers.map((user) => user.name || user.email),
            assigneeIds: userIds,
          };
        }
        return task;
      });
      onTaskUpdateRef.current?.(updatedTasks);
    }
  }, [availableUsers, onTaskAssigneesChange]);

  const handleTaskDateChange = useCallback(async (taskIdentifier: string, date: Date | undefined) => {
    const task = tasksRef.current.find(t => t.identifier === taskIdentifier || t.uid === taskIdentifier);
    if (!task) return;
    
    // Normalize the date before updating
    const normalizedDate = date ? normalizeDate(date) : undefined;
    
    if (onTaskDateChange && task.uid) {
      // Use backend API
      setUpdatingTaskId(task.uid);
      setUpdatingField('date');
      try {
        await onTaskDateChange(task.uid, normalizedDate);
        toast.success("Task date updated");
      } catch (error) {
        console.error("Failed to update task date:", error);
        toast.error("Failed to update task date");
      } finally {
        setUpdatingTaskId(null);
        setUpdatingField(null);
      }
    } else {
      // Fallback to local state
      const updatedTasks = tasksRef.current.map((task: SprintTask) => {
        if (task.identifier === taskIdentifier) {
          return { ...task, dueDate: date };
        }
        return task;
      });
      onTaskUpdateRef.current?.(updatedTasks);
    }
  }, [onTaskDateChange]);

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, task: SprintTask) => {
    // Use uid if available (backend), otherwise use identifier (legacy)
    const taskId = task.uid || task.identifier;
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
    setDraggedTaskId(taskId);
    setDraggingTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, taskId?: string, status?: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (taskId) setDragOverTaskId(taskId);
    if (status) setDragOverStatus(status);
  };

  const handleDragLeave = () => {
    setDragOverTaskId(null);
    setDragOverStatus(null);
  };

  const handleDrop = useCallback(async (e: React.DragEvent, targetStatus: string, targetIndex?: number) => {
    e.preventDefault();
    setDragOverTaskId(null);
    setDragOverStatus(null);
    setDraggedTaskId(null);

    const taskIdentifier = e.dataTransfer.getData("text/plain");
    if (!taskIdentifier) {
      setDraggingTaskId(null);
      return;
    }

    const sourceTask = tasksRef.current.find((task: SprintTask) => 
      task.identifier === taskIdentifier || task.uid === taskIdentifier
    );
    if (!sourceTask) {
      setDraggingTaskId(null);
      return;
    }

    // If status changed, update via backend API
    if (sourceTask.status !== targetStatus && onTaskStatusChange && sourceTask.uid) {
      setUpdatingTaskId(sourceTask.uid);
      setUpdatingField('status');
      try {
        await onTaskStatusChange(sourceTask.uid, targetStatus);
        toast.success("Task moved successfully");
        // Success - backend will update the task list via React Query
        setDraggingTaskId(null);
        setUpdatingTaskId(null);
        setUpdatingField(null);
        return;
      } catch (error) {
        console.error("Failed to update task status via drag and drop:", error);
        toast.error("Failed to move task");
        setDraggingTaskId(null);
        setUpdatingTaskId(null);
        setUpdatingField(null);
        // Fall through to local state update as fallback
      }
    } else {
      setDraggingTaskId(null);
    }

    // If status didn't change (just reordering) or backend update failed, use local state
    const updatedTasks = [...tasksRef.current];
    const sourceIndex = updatedTasks.findIndex((t) => 
      t.identifier === taskIdentifier || t.uid === taskIdentifier
    );

    if (sourceTask.status === targetStatus && targetIndex !== undefined) {
      // Reordering within same status
      updatedTasks.splice(sourceIndex, 1);
      updatedTasks.splice(
        targetIndex > sourceIndex ? targetIndex - 1 : targetIndex,
        0,
        sourceTask
      );
    } else {
      // Status change - update task status
      const taskToUpdate = { ...sourceTask, status: targetStatus as any };
      updatedTasks.splice(sourceIndex, 1);

      const insertIndex =
        targetIndex !== undefined
          ? updatedTasks.findIndex(
              (t) => t.status === targetStatus && updatedTasks.indexOf(t) >= targetIndex
            )
          : -1;

      if (insertIndex > -1) {
        updatedTasks.splice(insertIndex, 0, taskToUpdate);
      } else {
        const lastIndexInStatus = updatedTasks
          .map((t, idx) => (t.status === targetStatus ? idx : -1))
          .filter((idx) => idx !== -1)
          .pop();

        if (lastIndexInStatus !== undefined) {
          updatedTasks.splice(lastIndexInStatus + 1, 0, taskToUpdate);
        } else {
          updatedTasks.push(taskToUpdate);
        }
      }
    }

    // Fallback to local state update if backend is not available
    onTaskUpdateRef.current?.(updatedTasks);
  }, [onTaskStatusChange]);

  // Selection handlers
  const toggleTaskSelection = (taskIdentifier: string) => {
    setSelectedTaskIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskIdentifier)) {
        newSet.delete(taskIdentifier);
      } else {
        newSet.add(taskIdentifier);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedTaskIds.size === tasks.length && tasks.length > 0) {
      setSelectedTaskIds(new Set());
    } else {
      setSelectedTaskIds(new Set(tasks.map((t) => t.identifier)));
    }
  };

  const clearSelection = () => {
    setSelectedTaskIds(new Set());
  };

  // Bulk actions
  const handleBulkDelete = useCallback(async () => {
    const tasksToDelete = tasksRef.current.filter(
      (task: SprintTask) => selectedTaskIds.has(task.identifier) || selectedTaskIds.has(task.uid)
    );
    
    if (onTaskDelete) {
      // Use backend API for deletion
      try {
        await Promise.all(
          tasksToDelete
            .filter(task => task.uid)
            .map(task => onTaskDelete(task.uid))
        );
        toast.success(`${tasksToDelete.length} task(s) deleted successfully`);
        clearSelection();
      } catch (error) {
        console.error("Failed to delete tasks:", error);
        toast.error("Failed to delete tasks");
      }
    } else {
      // Fallback to local state
      const updatedTasks = tasksRef.current.filter(
        (task: SprintTask) => !selectedTaskIds.has(task.identifier) && !selectedTaskIds.has(task.uid)
      );
      onTaskUpdateRef.current?.(updatedTasks);
      clearSelection();
    }
  }, [selectedTaskIds, onTaskDelete]);

  const handleBulkMoveTo = useCallback((targetStatus: string) => {
    const updatedTasks = tasksRef.current.map((task: SprintTask) => {
      if (selectedTaskIds.has(task.identifier)) {
        return { ...task, status: targetStatus as "todo" | "in-progress" | "complete" };
      }
      return task;
    });
    onTaskUpdateRef.current?.(updatedTasks);
    clearSelection();
  }, [selectedTaskIds]);

  const handleBulkViewDetails = useCallback(() => {
    const selectedTasks = tasksRef.current.filter((task: SprintTask) =>
      selectedTaskIds.has(task.identifier)
    );
    if (selectedTasks.length === 1) {
      setSelectedTaskForModal(selectedTasks[0]);
    }
  }, [selectedTaskIds]);

  // Handle full task update from detail modal
  const handleTaskUpdate = useCallback((updatedTask: SprintTask) => {
    const updatedTasks = tasksRef.current.map((task: SprintTask) => {
      if (task.identifier === updatedTask.identifier) {
        return updatedTask;
      }
      return task;
    });
    onTaskUpdateRef.current?.(updatedTasks);
  }, []);

  // Handle task delete from modal
  const handleTaskDelete = useCallback(async (taskIdentifier: string) => {
    const task = tasksRef.current.find(t => t.identifier === taskIdentifier || t.uid === taskIdentifier);
    if (!task) return;
    
    if (onTaskDelete && task.uid) {
      // Use backend API
      try {
        await onTaskDelete(task.uid);
        toast.success("Task deleted successfully");
        setSelectedTaskForModal(null);
      } catch (error) {
        console.error("Failed to delete task:", error);
        toast.error("Failed to delete task");
      }
    } else {
      // Fallback to local state
      const updatedTasks = tasksRef.current.filter((task: SprintTask) => 
        task.identifier !== taskIdentifier && task.uid !== taskIdentifier
      );
      onTaskUpdateRef.current?.(updatedTasks);
      setSelectedTaskForModal(null);
    }
  }, [onTaskDelete]);

  // Toggle status section
  const toggleStatus = (status: string) => {
    setExpandedStatus((prev) => ({ ...prev, [status]: !prev[status] }));
  };

  // Start adding a new task
  const startAddingTask = (status: string) => {
    setAddingTaskStatus(status);
    setNewTaskTitle("");
  };

  // Cancel adding task - use useCallback to stabilize reference
  const cancelAddingTask = useCallback(() => {
    setAddingTaskStatus(null);
    setNewTaskTitle("");
  }, []);

  // Refs for onAddTask to keep saveNewTask stable
  const onAddTaskRef = useRef(onAddTask);

  useEffect(() => {
    onAddTaskRef.current = onAddTask;
  }, [onAddTask]);

  // Save new task - use useCallback to avoid stale closures
  const saveNewTask = useCallback(async (status: string) => {
    if (!newTaskTitle.trim()) {
      cancelAddingTask();
      return;
    }

    const newTask: Omit<SprintTask, "uid" | "identifier"> = {
      title: newTaskTitle.trim(),
      assignees: [],
      assigneeIds: [],
      priority: TASK_DEFAULTS.priority,
      status: status as any,
      subtasks: [],
      dueDate: undefined,
      comments: [],
      attachments: TASK_DEFAULTS.attachments,
    };

    if (onAddTaskRef.current) {
      // Use backend API if provided
      try {
        await onAddTaskRef.current(newTask);
      } catch (error) {
        console.error("Failed to create task:", error);
      }
    } else {
      // Fallback to local state
      const taskWithId: SprintTask = {
        ...newTask,
        uid: TASK_DEFAULTS.uid,
        identifier: generateUniqueId()
      };
      const updatedTasks = [...tasksRef.current, taskWithId];
      onTaskUpdateRef.current?.(updatedTasks);
    }

    cancelAddingTask();
  }, [newTaskTitle, cancelAddingTask]);

  // Handle key press for new task input
  const handleKeyPress = (e: React.KeyboardEvent, status: string) => {
    if (e.key === KEYBOARD_SHORTCUTS.save) {
      e.preventDefault();
      saveNewTask(status);
    } else if (e.key === KEYBOARD_SHORTCUTS.cancel) {
      cancelAddingTask();
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="relative space-y-3 sm:space-y-4 md:space-y-6 w-full max-w-full overflow-x-hidden">
        {/* Progress Overview Card */}
        <GlassCard variant="subtle" size="lg" className="border border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
                <Icon icon={Layers} size="md" color="primary" />
              </div>
              <div>
                <Text variant="body-sm" weight="semibold" className="text-foreground sm:text-base">
                  Sprint Progress
                </Text>
                <Text variant="caption" color="muted" className="text-[10px] sm:text-xs">
                  {tasks.length} total tasks
                </Text>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-6">
              {/* Select All Checkbox */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleSelectAll}
                    className={cn(
                      "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg",
                      "border border-border/50 hover:border-primary/50",
                      "bg-background/50 hover:bg-primary/5",
                      "transition-all duration-200 touch-manipulation",
                      selectedTaskIds.size > 0 && "border-primary/50 bg-primary/5"
                    )}
                  >
                    <div
                      className={cn(
                        "h-3.5 w-3.5 sm:h-4 sm:w-4 rounded border-2 flex items-center justify-center flex-shrink-0",
                        "transition-all duration-200",
                        selectedTaskIds.size === tasks.length && tasks.length > 0
                          ? "bg-primary border-primary"
                          : selectedTaskIds.size > 0
                          ? "bg-primary/20 border-primary"
                          : "border-muted-foreground/30"
                      )}
                    >
                      {selectedTaskIds.size === tasks.length && tasks.length > 0 && (
                        <Icon icon={Check} size="xs" className="text-primary-foreground" />
                      )}
                      {selectedTaskIds.size > 0 && selectedTaskIds.size < tasks.length && (
                        <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 bg-primary rounded-sm" />
                      )}
                    </div>
                    <Text variant="body-sm" weight="medium" color="muted" className="whitespace-nowrap text-[10px] sm:text-sm hidden sm:inline">
                      {selectedTaskIds.size > 0
                        ? `${selectedTaskIds.size} selected`
                        : "Select all"}
                    </Text>
                    <Text variant="body-sm" weight="medium" color="muted" className="whitespace-nowrap text-[10px] sm:hidden">
                      {selectedTaskIds.size > 0 ? selectedTaskIds.size : "All"}
                    </Text>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {selectedTaskIds.size === tasks.length && tasks.length > 0
                    ? "Deselect all tasks"
                    : "Select all tasks"}
                </TooltipContent>
              </Tooltip>

              {STATUS_ORDER.map((status) => {
                const count = groupedTasks[status]?.length || 0;
                const colorConfig = STATUS_COLORS[status as keyof typeof STATUS_COLORS];
                return (
                  <div key={status} className="flex items-center gap-1 sm:gap-2">
                    <div className={cn("h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full flex-shrink-0", colorConfig?.dot)} />
                    <Text variant="body-sm" weight="medium" color="muted" className="whitespace-nowrap text-[10px] sm:text-sm">
                      {count} <span className="hidden sm:inline">{STATUS_LABELS[status as keyof typeof STATUS_LABELS]}</span>
                    </Text>
                  </div>
                );
              })}
            </div>
          </div>
          <ProgressBar
            value={overallProgress}
            size="xs"
            color="gradient"
            animated={overallProgress < 100}
            className="sm:h-1.5"
          />
        </GlassCard>

        {/* Bulk Actions Toolbar */}
        {selectedTaskIds.size > 0 && (
          <GlassCard
            variant="colorful"
            size="lg"
            className={cn(
              "border-2 border-primary/30",
              "animate-fade-in-up",
              "sticky top-4 z-10"
            )}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <Text variant="body" weight="semibold" className="text-foreground">
                    {selectedTaskIds.size} task{selectedTaskIds.size > 1 ? "s" : ""} selected
                  </Text>
                  <Text variant="caption" color="muted" className="hidden sm:block">
                    Choose an action to apply to selected tasks
                  </Text>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* Move To Dropdown */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative group flex-1 sm:flex-none">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={selectedTaskIds.size > 1}
                        className={cn(
                          "gap-2 h-9 px-3 sm:px-4 w-full sm:w-auto justify-center",
                          "bg-white/60 hover:bg-white dark:bg-black/20 dark:hover:bg-black/40",
                          "border border-border/50",
                          selectedTaskIds.size > 1 && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <Icon icon={MoveRight} size="sm" />
                        <span className="hidden sm:inline">Move To</span>
                        <span className="sm:hidden">Move</span>
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                      {selectedTaskIds.size === 1 && (
                        <div
                          className={cn(
                            "absolute top-full right-0 mt-1 w-48",
                            "bg-background border border-border rounded-lg shadow-lg",
                            "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
                            "transition-all duration-200",
                            "z-50"
                          )}
                        >
                          {STATUS_ORDER.map((status) => {
                            const colorConfig = STATUS_COLORS[status as keyof typeof STATUS_COLORS];
                            return (
                              <button
                                key={status}
                                onClick={() => handleBulkMoveTo(status)}
                                className={cn(
                                  "w-full flex items-center gap-2 px-3 py-2",
                                  "hover:bg-muted/50 transition-colors",
                                  "first:rounded-t-lg last:rounded-b-lg"
                                )}
                              >
                                <StatusIcon status={status} className={cn("h-4 w-4", colorConfig?.text)} />
                                <Text variant="body-sm" weight="medium">
                                  {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
                                </Text>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {selectedTaskIds.size > 1
                      ? "Can only move one task at a time"
                      : "Move selected task to another status"}
                  </TooltipContent>
                </Tooltip>

                {/* View Details Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBulkViewDetails}
                      disabled={selectedTaskIds.size > 1}
                      className={cn(
                        "gap-2 h-9 px-3 sm:px-4 flex-1 sm:flex-none justify-center",
                        "bg-white/60 hover:bg-white dark:bg-black/20 dark:hover:bg-black/40",
                        "border border-border/50",
                        selectedTaskIds.size > 1 && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <Icon icon={Eye} size="sm" />
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">View</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {selectedTaskIds.size > 1
                      ? "Can only view details for one task at a time"
                      : "View details of selected task"}
                  </TooltipContent>
                </Tooltip>

                {/* Delete Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBulkDelete}
                      className={cn(
                        "gap-2 h-9 px-3 sm:px-4 flex-1 sm:flex-none justify-center",
                        "bg-destructive/10 hover:bg-destructive/20 text-destructive",
                        "border border-destructive/30 hover:border-destructive/50"
                      )}
                    >
                      <Icon icon={Trash2} size="sm" />
                      <span>Delete</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete selected tasks</TooltipContent>
                </Tooltip>

                {/* Clear Selection Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  className="h-9 px-3 hidden sm:flex"
                >
                  Clear
                </Button>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Status Sections */}
        <div className="space-y-4">
          {STATUS_ORDER.map((status, sectionIndex) => {
            const statusTasks = groupedTasks[status] || [];
            const isExpanded = expandedStatus[status];
            const isAddingTask = addingTaskStatus === status;
            const colorConfig = STATUS_COLORS[status as keyof typeof STATUS_COLORS];
            const isDragOver = dragOverStatus === status;

            return (
              <div
                key={status}
                className={cn(
                  STATUS_SECTION_STYLES.container,
                  isDragOver && CARD_STYLES.dragOver,
                  "animate-fade-in-up"
                )}
                style={{ animationDelay: `${sectionIndex * 50}ms` }}
                onDragOver={(e) => handleDragOver(e, undefined, status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, status, statusTasks.length)}
              >
                {/* Status Header */}
                <div
                  className={cn(
                    STATUS_SECTION_STYLES.header,
                    colorConfig?.gradient,
                    colorConfig?.borderGradient,
                    "flex-wrap sm:flex-nowrap gap-3 sm:gap-0"
                  )}
                >
                  <div className={cn(STATUS_SECTION_STYLES.headerLeft, "flex-1 min-w-0")}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStatus(status)}
                      className={cn(
                        BUTTON_STYLES.iconSm,
                        "hover:bg-white/50 dark:hover:bg-black/20 flex-shrink-0"
                      )}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>

                    <div className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0",
                      colorConfig?.bgLight
                    )}>
                      <StatusIcon
                        status={status}
                        className={cn("h-4.5 w-4.5", colorConfig?.text)}
                      />
                    </div>

                    <div className="min-w-0">
                      <Text variant="body" weight="semibold" className="text-foreground truncate">
                        {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
                      </Text>
                    </div>

                    <TaskCountBadge count={statusTasks.length} status={status} />
                  </div>

                  <div className={cn(STATUS_SECTION_STYLES.headerRight, "flex-shrink-0")}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startAddingTask(status)}
                      className={cn(
                        BUTTON_STYLES.addTask,
                        "bg-white/60 hover:bg-white dark:bg-black/20 dark:hover:bg-black/40",
                        "border border-border/50",
                        "whitespace-nowrap"
                      )}
                    >
                      <Icon icon={Plus} size="sm" />
                      <span className="hidden sm:inline">{UI_TEXT.buttons.addTask}</span>
                      <span className="sm:hidden">Add</span>
                    </Button>
                  </div>
                </div>

                {/* Status Content */}
                {isExpanded && (
                  <div className={STATUS_SECTION_STYLES.content}>
                    {/* Task List */}
                    <div className="space-y-2 stagger-children">
                      {statusTasks.map((task: SprintTask, taskIndex: number) => {
                        const isDragging = draggedTaskId === task.identifier;
                        const isTaskDragOver = dragOverTaskId === task.identifier;

                        return (
                          <div
                            key={task.identifier}
                            draggable={!(updatingTaskId === (task.uid || task.identifier) && updatingField === 'status')}
                            onDragStart={(e) => handleDragStart(e, task)}
                            onDragOver={(e) => handleDragOver(e, task.identifier)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, status, taskIndex)}
                            className={cn(
                              TASK_ROW_STYLES.base,
                              isDragging && CARD_STYLES.dragging,
                              isTaskDragOver && CARD_STYLES.dragOver,
                              (updatingTaskId === (task.uid || task.identifier) && updatingField === 'status') && "opacity-60 relative"
                            )}
                          >
                            {/* Drag and drop loading indicator */}
                            {draggingTaskId === (task.uid || task.identifier) && updatingTaskId === (task.uid || task.identifier) && updatingField === 'status' && (
                              <div className="absolute top-2 right-2 z-20 animate-in fade-in-0 slide-in-from-top-1 duration-200">
                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/10 border border-primary/20 shadow-md backdrop-blur-sm">
                                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                                  <span className="text-xs font-medium text-primary">Moving...</span>
                                </div>
                              </div>
                            )}
                            {/* Desktop Grid Layout */}
                            <div className="hidden md:block">
                              <div
                                className={cn(
                                  TASK_ROW_STYLES.content,
                                  "grid items-center gap-3 grid-cols-[auto_auto_minmax(200px,1fr)_140px_120px_100px_110px_80px]"
                                )}
                              >
                                {/* Checkbox */}
                                <div className="flex items-center justify-center">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleTaskSelection(task.identifier);
                                        }}
                                        className={cn(
                                          "flex items-center justify-center",
                                          "cursor-pointer opacity-0 group-hover:opacity-100",
                                          selectedTaskIds.has(task.identifier) && "opacity-100",
                                          "transition-opacity duration-150"
                                        )}
                                      >
                                        <div
                                          className={cn(
                                            "h-4 w-4 rounded border-2 flex items-center justify-center",
                                            "transition-all duration-200",
                                            selectedTaskIds.has(task.identifier)
                                              ? "bg-primary border-primary"
                                              : "border-muted-foreground/30 hover:border-primary/50"
                                          )}
                                        >
                                          {selectedTaskIds.has(task.identifier) && (
                                            <Icon icon={Check} size="xs" className="text-primary-foreground" />
                                          )}
                                        </div>
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="left">
                                      {selectedTaskIds.has(task.identifier) ? "Deselect task" : "Select task"}
                                    </TooltipContent>
                                  </Tooltip>
                                </div>

                                {/* Drag Handle */}
                                <div className="flex items-center">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className={TASK_ROW_STYLES.dragHandle}>
                                        <Icon icon={GripVertical} size="sm" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="left">
                                      {UI_TEXT.tooltips.dragToReorder}
                                    </TooltipContent>
                                  </Tooltip>
                                </div>

                                {/* Task Title & Subtasks */}
                                <div className="min-w-0 space-y-1.5">
                                  <div
                                    className="cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTaskForModal(task);
                                    }}
                                  >
                                    <Text
                                      variant="body"
                                      weight="medium"
                                      className={cn(
                                        TASK_ROW_STYLES.title,
                                        "hover:text-primary transition-colors"
                                      )}
                                    >
                                      {task.title}
                                    </Text>
                                  </div>

                                  {task.subtasks && task.subtasks.length > 0 && (
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Icon icon={ListTodo} size="xs" />
                                        <span>
                                          {task.subtasks.filter((s: { completed: boolean }) => s.completed).length}/
                                          {task.subtasks.length}
                                        </span>
                                      </div>
                                      <div className="flex-1 max-w-[80px]">
                                        <ProgressBar
                                          value={
                                            (task.subtasks.filter((s: { completed: boolean }) => s.completed).length /
                                              task.subtasks.length) *
                                            100
                                          }
                                          size="xs"
                                          color="success"
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Assignee */}
                                <div onClick={(e) => e.stopPropagation()} className="relative">
                                  <AvatarSelectGroup
                                    users={availableUsers}
                                    selectedUserIds={getUserIdsFromTask(task)}
                                    onSelectionChange={(userIds) => handleTaskAssigneesChange(task.uid || task.identifier, userIds)}
                                    placeholder={UI_TEXT.placeholders.unassigned}
                                    allowMultiple={true}
                                    className="w-full"
                                    disabled={updatingTaskId === (task.uid || task.identifier) && updatingField === 'assignees'}
                                  />
                                  {updatingTaskId === (task.uid || task.identifier) && updatingField === 'assignees' && (
                                    <div className="absolute top-1 right-1 z-20 animate-in fade-in-0 slide-in-from-top-1 duration-200">
                                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 border border-primary/20 shadow-sm">
                                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Due Date */}
                                <div onClick={(e) => e.stopPropagation()} className="relative">
                                  <DatePicker
                                    key={`due-date-${task.uid || task.identifier}-${sprintId || 'no-sprint'}-${effectiveMinDate?.getTime() || 'no-min'}-${effectiveMaxDate?.getTime() || 'no-max'}`}
                                    value={task.dueDate ? normalizeDate(task.dueDate) : undefined}
                                    onChange={(date) => handleTaskDateChange(task.uid || task.identifier, date)}
                                    placeholder={UI_TEXT.placeholders.setDate}
                                    className="text-xs sm:text-sm"
                                    minDate={effectiveMinDate}
                                    maxDate={effectiveMaxDate}
                                    disabled={updatingTaskId === (task.uid || task.identifier) && updatingField === 'date'}
                                  />
                                  {updatingTaskId === (task.uid || task.identifier) && updatingField === 'date' && (
                                    <div className="absolute top-1 right-1 z-20 animate-in fade-in-0 slide-in-from-top-1 duration-200">
                                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 border border-primary/20 shadow-sm">
                                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Priority */}
                                <div onClick={(e) => e.stopPropagation()} className="relative">
                                  <PrioritySelect
                                    value={task.priority}
                                    onChange={(value) => handleTaskPriorityChange(task.uid || task.identifier, value)}
                                    disabled={updatingTaskId === (task.uid || task.identifier) && updatingField === 'priority'}
                                  />
                                  {updatingTaskId === (task.uid || task.identifier) && updatingField === 'priority' && (
                                    <div className="absolute top-1 right-1 z-20 animate-in fade-in-0 slide-in-from-top-1 duration-200">
                                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 border border-primary/20 shadow-sm">
                                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Status */}
                                <div onClick={(e) => e.stopPropagation()} className="relative">
                                  <StatusSelect
                                    value={task.status}
                                    onChange={(value) => handleTaskStatusChange(task.uid || task.identifier, value)}
                                    disabled={updatingTaskId === (task.uid || task.identifier) && updatingField === 'status'}
                                  />
                                  {updatingTaskId === (task.uid || task.identifier) && updatingField === 'status' && (
                                    <div className="absolute top-1 right-1 z-20 animate-in fade-in-0 slide-in-from-top-1 duration-200">
                                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 border border-primary/20 shadow-sm">
                                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Comments */}
                                <div className="flex items-center justify-end gap-1">
                                  {getCommentCount(task) > 0 && (
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <MessageSquare className="h-3.5 w-3.5" />
                                      <span className="text-xs">{getCommentCount(task)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Mobile Card Layout */}
                            <div className="md:hidden p-3 space-y-3">
                              {/* Header Row */}
                              <div className="flex items-start gap-3">
                                {/* Checkbox & Drag */}
                                <div className="flex items-center gap-2 flex-shrink-0 pt-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleTaskSelection(task.identifier);
                                    }}
                                    className="flex items-center justify-center touch-manipulation"
                                  >
                                    <div
                                      className={cn(
                                        "h-5 w-5 rounded border-2 flex items-center justify-center",
                                        "transition-all duration-200",
                                        selectedTaskIds.has(task.identifier)
                                          ? "bg-primary border-primary"
                                          : "border-muted-foreground/30"
                                      )}
                                    >
                                      {selectedTaskIds.has(task.identifier) && (
                                        <Icon icon={Check} size="xs" className="text-primary-foreground" />
                                      )}
                                    </div>
                                  </button>
                                  <div className={cn(TASK_ROW_STYLES.dragHandle, "p-1.5")}>
                                    <Icon icon={GripVertical} size="sm" />
                                  </div>
                                </div>

                                {/* Task Content */}
                                <div className="flex-1 min-w-0 space-y-2">
                                  {/* Task Title */}
                                  <div
                                    className="cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTaskForModal(task);
                                    }}
                                  >
                                    <Text
                                      variant="body"
                                      weight="semibold"
                                      className="text-foreground leading-snug hover:text-primary transition-colors"
                                    >
                                      {task.title}
                                    </Text>
                                  </div>

                                  {/* Subtasks Progress */}
                                  {task.subtasks && task.subtasks.length > 0 && (
                                    <div className="flex items-center gap-2">
                                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Icon icon={ListTodo} size="xs" />
                                        <span className="font-medium">
                                          {task.subtasks.filter((s: { completed: boolean }) => s.completed).length}/
                                          {task.subtasks.length}
                                        </span>
                                      </div>
                                      <div className="flex-1">
                                        <ProgressBar
                                          value={
                                            (task.subtasks.filter((s: { completed: boolean }) => s.completed).length /
                                              task.subtasks.length) *
                                            100
                                          }
                                          size="xs"
                                          color="success"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {/* Meta Info Row */}
                                  <div className="flex flex-wrap items-center gap-2">
                                    {/* Priority */}
                                    <div onClick={(e) => e.stopPropagation()} className="touch-manipulation relative">
                                      <PrioritySelect
                                        value={task.priority}
                                        onChange={(value) => handleTaskPriorityChange(task.uid || task.identifier, value)}
                                        disabled={updatingTaskId === (task.uid || task.identifier) && updatingField === 'priority'}
                                      />
                                      {updatingTaskId === (task.uid || task.identifier) && updatingField === 'priority' && (
                                        <div className="absolute top-0.5 right-0.5 z-20 animate-in fade-in-0 slide-in-from-top-1 duration-200">
                                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 shadow-sm">
                                            <Loader2 className="h-2.5 w-2.5 animate-spin text-primary" />
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Status */}
                                    <div onClick={(e) => e.stopPropagation()} className="touch-manipulation relative">
                                      <StatusSelect
                                        value={task.status}
                                        onChange={(value) => handleTaskStatusChange(task.uid || task.identifier, value)}
                                        disabled={updatingTaskId === (task.uid || task.identifier) && updatingField === 'status'}
                                      />
                                      {updatingTaskId === (task.uid || task.identifier) && updatingField === 'status' && (
                                        <div className="absolute top-0.5 right-0.5 z-20 animate-in fade-in-0 slide-in-from-top-1 duration-200">
                                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 shadow-sm">
                                            <Loader2 className="h-2.5 w-2.5 animate-spin text-primary" />
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Comments */}
                                    {getCommentCount(task) > 0 && (
                                      <div className="flex items-center gap-1 text-muted-foreground px-2 py-1 rounded-md bg-muted/30">
                                        <MessageSquare className="h-3.5 w-3.5" />
                                        <span className="text-xs font-medium">{getCommentCount(task)}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Assignee & Due Date Row */}
                                  <div className="flex flex-wrap items-center gap-2 pt-1">
                                    {/* Assignee */}
                                    {getUserIdsFromTask(task).length > 0 && (
                                      <div onClick={(e) => e.stopPropagation()} className="flex-1 min-w-[120px] touch-manipulation flex items-center relative">
                                        <AvatarSelectGroup
                                          users={availableUsers}
                                          selectedUserIds={getUserIdsFromTask(task)}
                                          onSelectionChange={(userIds) => handleTaskAssigneesChange(task.uid || task.identifier, userIds)}
                                          placeholder={UI_TEXT.placeholders.unassigned}
                                          allowMultiple={true}
                                          disabled={updatingTaskId === (task.uid || task.identifier) && updatingField === 'assignees'}
                                        />
                                        {updatingTaskId === (task.uid || task.identifier) && updatingField === 'assignees' && (
                                          <div className="absolute top-0.5 right-0.5 z-20 animate-in fade-in-0 slide-in-from-top-1 duration-200">
                                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 shadow-sm">
                                              <Loader2 className="h-2.5 w-2.5 animate-spin text-primary" />
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {/* Due Date */}
                                    {task.dueDate && (
                                      <div onClick={(e) => e.stopPropagation()} className="flex-1 min-w-[90px] touch-manipulation relative">
                                        <DatePicker
                                          key={`due-date-mobile-${task.uid || task.identifier}-${sprintId || 'no-sprint'}-${effectiveMinDate?.getTime() || 'no-min'}-${effectiveMaxDate?.getTime() || 'no-max'}`}
                                          value={task.dueDate ? normalizeDate(task.dueDate) : undefined}
                                          onChange={(date) => handleTaskDateChange(task.uid || task.identifier, date)}
                                          placeholder={UI_TEXT.placeholders.setDate}
                                          className="text-xs"
                                          minDate={effectiveMinDate}
                                          maxDate={effectiveMaxDate}
                                          disabled={updatingTaskId === (task.uid || task.identifier) && updatingField === 'date'}
                                        />
                                        {updatingTaskId === (task.uid || task.identifier) && updatingField === 'date' && (
                                          <div className="absolute top-0.5 right-0.5 z-20 animate-in fade-in-0 slide-in-from-top-1 duration-200">
                                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 shadow-sm">
                                              <Loader2 className="h-2.5 w-2.5 animate-spin text-primary" />
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add Task Form */}
                    {isAddingTask && (
                      <GlassCard
                        variant="colorful"
                        size="lg"
                        className={cn(
                          "mt-3 border-2 border-primary/30",
                          "animate-fade-in-up"
                        )}
                      >
                        <div className="space-y-3">
                          {/* Task Title Input */}
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-xl",
                              "bg-primary/10"
                            )}>
                              <Sparkles className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <Input
                                ref={newTaskInputRef}
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                onKeyDown={(e) => handleKeyPress(e, status)}
                                placeholder={UI_TEXT.placeholders.taskInput}
                                className={cn(
                                  "h-10 text-base border-0 bg-transparent",
                                  "focus:ring-0 placeholder:text-muted-foreground/60"
                                )}
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={cancelAddingTask}
                              className="h-9 px-3"
                            >
                              {UI_TEXT.buttons.cancel}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => saveNewTask(status)}
                              disabled={!newTaskTitle.trim()}
                              className={cn(
                                "h-9 px-4 gap-2",
                                "bg-primary hover:bg-primary/90",
                                "shadow-primary-sm hover:shadow-primary",
                                "transition-all duration-200"
                              )}
                            >
                              <Icon icon={Plus} size="sm" />
                              {UI_TEXT.buttons.addTask}
                            </Button>
                          </div>
                          <Text variant="caption" color="muted" className="ml-12">
                            {UI_TEXT.placeholders.taskInputHint}
                          </Text>
                        </div>
                      </GlassCard>
                    )}

                    {/* Empty State */}
                    {statusTasks.length === 0 && !isAddingTask && (
                      <div
                        className={STATUS_SECTION_STYLES.emptyState}
                        onClick={() => startAddingTask(status)}
                        onDragOver={(e) => handleDragOver(e, undefined, status)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, status, 0)}
                      >
                        <div className={cn(
                          "flex h-14 w-14 items-center justify-center rounded-2xl mb-3",
                          "bg-primary/10 group-hover:bg-primary/20",
                          "group-hover:scale-110",
                          "transition-all duration-300"
                        )}>
                          <Icon icon={Plus} size="lg" color="primary" />
                        </div>
                        <Text variant="body" weight="medium" className="text-foreground mb-1">
                          {UI_TEXT.emptyStates.noTasks(
                            STATUS_LABELS[status as keyof typeof STATUS_LABELS]
                          )}
                        </Text>
                        <Text variant="caption" color="muted">
                          {UI_TEXT.emptyStates.dragHint}
                        </Text>
                      </div>
                    )}

                    {/* Add Another Task Button */}
                    {statusTasks.length > 0 && !isAddingTask && (
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => startAddingTask(status)}
                        className={cn(
                          "w-full h-12 mt-2",
                          "border-2 border-dashed border-muted-foreground/20",
                          "hover:border-primary/40 hover:bg-primary/5",
                          "text-muted-foreground hover:text-primary",
                          "rounded-xl",
                          "transition-all duration-200",
                          "group"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg",
                            "bg-muted/50 group-hover:bg-primary/10",
                            "transition-colors duration-200"
                          )}>
                            <Icon icon={Plus} size="sm" />
                          </div>
                          <span className="font-medium">
                            {UI_TEXT.emptyStates.addAnother(
                              STATUS_LABELS[status as keyof typeof STATUS_LABELS]
                            )}
                          </span>
                        </div>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Task Detail Modal */}
        {selectedTaskForModal && (
          <Modal.Provider defaultOpen={true} onOpenChange={(open) => !open && setSelectedTaskForModal(null)}>
            <TaskDetailModal
              task={selectedTaskForModal}
              availableUsers={availableUsers}
              onTaskUpdate={handleTaskUpdate}
              onTaskDelete={handleTaskDelete}
              onBackendUpdate={async (taskId, data) => {
                try {
                  const { taskApi } = await import("@/core/services/api-helpers");

                  // 1) Prepare payload for backend: use assigneeIds only, strip view-only fields
                  const payload: any = { ...data };
                  delete payload.assignees;   // backend only knows assigneeIds
                  delete payload.comments;    // managed via separate endpoints
                  delete payload.subtasks;    // managed via separate endpoints

                  // Persist ALL fields (description, assigneeIds, dates, estimatedCost, status, priority, etc.)
                  await taskApi.update(taskId, payload);

                  // 2) Call legacy per-field callbacks for any extra UI side‑effects
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

                  // 3) Invalidate React Query cache so lists stay in sync
                  if (projectId) {
                    await queryClient.invalidateQueries({ queryKey: ["tasks", "project", projectId] });
                  }
                  await queryClient.invalidateQueries({ queryKey: ["tasks"] });

                  // 4) Fetch fresh task from backend and update local list + modal
                  const refreshedTask = await taskApi.getByUid(taskId);
                  const updatedTasks = tasksRef.current.map((t: SprintTask) =>
                    t.uid === taskId ? refreshedTask : t
                  );
                  onTaskUpdateRef.current?.(updatedTasks);
                  setSelectedTaskForModal(refreshedTask);
                } catch (error) {
                  console.error("[SprintListView] onBackendUpdate ERROR", error);
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
                
                // Update the selected task in the list
                const updatedTasks = tasksRef.current.map((t: SprintTask) => 
                  t.uid === taskId ? refreshedTask : t
                );
                onTaskUpdateRef.current?.(updatedTasks);
                setSelectedTaskForModal(refreshedTask);
                return refreshedTask;
              }}
              minDate={minDate}
              maxDate={maxDate}
            />
          </Modal.Provider>
        )}
      </div>
    </TooltipProvider>
  );
}
