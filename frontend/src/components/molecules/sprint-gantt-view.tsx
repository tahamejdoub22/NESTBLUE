// src/components/molecules/sprint-gantt-view.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { Text } from "@/components/atoms/text";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import { Card } from "@/components/atoms/card";
import { GlassCard } from "@/components/atoms/glass-card";
import { Task, TaskPriority, TaskStatus } from "@/interfaces/task.interface";
import {
  ChevronLeft,
  ChevronRight,
  GanttChart as GanttIcon,
  ZoomIn,
  ZoomOut,
  Calendar,
  Plus,
  Edit2,
  X,
  Check,
  Grip,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  differenceInDays,
  addMonths,
  subMonths,
  isWithinInterval,
  startOfDay,
  addDays,
  isToday,
  startOfWeek,
  endOfWeek,
  eachWeekOfInterval,
  isSameDay,
} from "date-fns";
import { PrioritySelect } from "@/components/molecules/priority-select";
import { StatusSelect } from "@/components/molecules/status-select";
import { DatePicker } from "@/components/molecules/date-picker";
import { AvatarSelectGroup } from "@/components/molecules/avatar-select-group";
import { DEFAULT_AVAILABLE_USERS, TASK_DEFAULTS } from "@/constants/sprint.constants";
import { User } from "@/components/molecules/avatar-select-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/atoms";

type ViewMode = "day" | "week" | "month";

interface SprintGanttViewProps {
  tasks: Task[];
  onTaskUpdate?: (tasks: Task[]) => void;
  onAddTask?: (task: Omit<Task, "uid" | "identifier">) => void | Promise<void>;
  availableUsers?: User[];
  onTaskStatusChange?: (taskId: string, status: string) => Promise<void>;
  onTaskPriorityChange?: (taskId: string, priority: string) => Promise<void>;
  onTaskAssigneesChange?: (taskId: string, userIds: string[]) => Promise<void>;
  onTaskDateChange?: (taskId: string, date: Date | undefined) => Promise<void>;
  onTaskDelete?: (taskId: string) => Promise<void>;
  minDate?: Date;
  maxDate?: Date;
  projectId?: string;
}

const PRIORITY_COLORS = {
  urgent: "bg-red-500 hover:bg-red-600",
  high: "bg-orange-500 hover:bg-orange-600",
  medium: "bg-yellow-500 hover:bg-yellow-600",
  low: "bg-blue-500 hover:bg-blue-600",
};

const STATUS_COLORS = {
  todo: "bg-blue-500/90 hover:bg-blue-600 border-blue-600",
  "in-progress": "bg-yellow-500/90 hover:bg-yellow-600 border-yellow-600",
  complete: "bg-green-500/90 hover:bg-green-600 border-green-600",
  backlog: "bg-gray-500/90 hover:bg-gray-600 border-gray-600",
};

export function SprintGanttView({
  tasks,
  onTaskUpdate,
  onAddTask,
  availableUsers = DEFAULT_AVAILABLE_USERS,
  onTaskStatusChange,
  onTaskPriorityChange,
  onTaskAssigneesChange,
  onTaskDateChange,
  onTaskDelete,
  minDate,
  maxDate,
  projectId,
}: SprintGanttViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Filter tasks that have dates and convert string dates to Date objects
  const tasksWithDates = useMemo(() => {
    return tasks
      .filter((task) => task.dueDate || task.startDate)
      .map((task) => ({
        ...task,
        dueDate: task.dueDate 
          ? (task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate))
          : undefined,
        startDate: task.startDate 
          ? (task.startDate instanceof Date ? task.startDate : new Date(task.startDate))
          : undefined,
      }))
      .filter((task) => {
        // Filter out invalid dates
        if (task.dueDate && isNaN(task.dueDate.getTime())) return false;
        if (task.startDate && isNaN(task.startDate.getTime())) return false;
        return true;
      });
  }, [tasks]);

  // Get timeline range based on view mode
  const timelineRange = useMemo(() => {
    if (viewMode === "week") {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(currentDate);
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    } else if (viewMode === "day") {
      const dayStart = startOfDay(currentDate);
      return eachDayOfInterval({ start: dayStart, end: addDays(dayStart, 6) });
    } else {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      return eachDayOfInterval({ start: monthStart, end: monthEnd });
    }
  }, [currentDate, viewMode]);

  // Calculate today marker position
  const todayPosition = useMemo(() => {
    const today = new Date();
    const rangeStart = timelineRange[0];
    const rangeEnd = timelineRange[timelineRange.length - 1];

    if (!isWithinInterval(today, { start: rangeStart, end: rangeEnd })) {
      return null;
    }

    const offsetDays = differenceInDays(startOfDay(today), startOfDay(rangeStart));
    const totalDays = timelineRange.length;
    return (offsetDays / totalDays) * 100;
  }, [timelineRange]);

  // Calculate task bar position and width
  const getTaskBarStyle = useCallback((task: Task) => {
    const rangeStart = timelineRange[0];
    const rangeEnd = timelineRange[timelineRange.length - 1];

    const taskStart = task.startDate || task.dueDate;
    const taskEnd = task.dueDate || task.startDate;

    if (!taskStart || !taskEnd) return null;

    // Check if task is visible in current range
    const isVisible =
      isWithinInterval(taskStart, { start: rangeStart, end: rangeEnd }) ||
      isWithinInterval(taskEnd, { start: rangeStart, end: rangeEnd }) ||
      (taskStart < rangeStart && taskEnd > rangeEnd);

    if (!isVisible) return null;

    const displayStart = taskStart < rangeStart ? rangeStart : taskStart;
    const displayEnd = taskEnd > rangeEnd ? rangeEnd : taskEnd;

    const offsetDays = differenceInDays(startOfDay(displayStart), startOfDay(rangeStart));
    const durationDays = differenceInDays(startOfDay(displayEnd), startOfDay(displayStart)) + 1;

    const totalDays = timelineRange.length;
    const leftPercent = (offsetDays / totalDays) * 100;
    const widthPercent = (durationDays / totalDays) * 100;

    return {
      left: `${leftPercent}%`,
      width: `${Math.max(widthPercent, 2)}%`,
      minWidth: "20px",
    };
  }, [timelineRange]);

  // Navigation handlers
  const previousPeriod = () => {
    if (viewMode === "week") {
      setCurrentDate(addDays(currentDate, -7));
    } else if (viewMode === "day") {
      setCurrentDate(addDays(currentDate, -7));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const nextPeriod = () => {
    if (viewMode === "week") {
      setCurrentDate(addDays(currentDate, 7));
    } else if (viewMode === "day") {
      setCurrentDate(addDays(currentDate, 7));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Task update handlers
  const updateTask = useCallback(async (taskIdentifier: string, updates: Partial<Task>) => {
    const task = tasks.find(t => t.identifier === taskIdentifier || t.uid === taskIdentifier);
    if (!task) return;
    
    // Use backend API if available
    if (task.uid) {
      try {
        if (updates.status && onTaskStatusChange) {
          await onTaskStatusChange(task.uid, updates.status as string);
        } else if (updates.priority && onTaskPriorityChange) {
          await onTaskPriorityChange(task.uid, updates.priority as string);
        } else if (updates.assignees && onTaskAssigneesChange) {
          const assigneeIds = (updates as any).assigneeIds || 
            availableUsers
              .filter(user => updates.assignees?.includes(user.name || user.email))
              .map(user => user.id);
          await onTaskAssigneesChange(task.uid, assigneeIds);
        } else if ((updates.dueDate !== undefined || updates.startDate !== undefined) && onTaskDateChange) {
          const date = updates.dueDate || updates.startDate;
          await onTaskDateChange(task.uid, date);
        }
      } catch (error) {
        console.error("Failed to update task:", error);
      }
    }
    
    // Also update local state
    if (onTaskUpdate) {
      const updatedTasks = tasks.map(t =>
        t.identifier === taskIdentifier || t.uid === taskIdentifier ? { ...t, ...updates } : t
      );
      onTaskUpdate(updatedTasks);
    }
  }, [tasks, onTaskUpdate, onTaskStatusChange, onTaskPriorityChange, onTaskAssigneesChange, onTaskDateChange, availableUsers]);

  const handleBarDragStart = (e: React.DragEvent, taskIdentifier: string) => {
    e.dataTransfer.effectAllowed = "move";
    setDraggedTaskId(taskIdentifier);
  };

  const handleBarDragEnd = () => {
    setDraggedTaskId(null);
  };

  const handleBarDrop = useCallback(async (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    if (!draggedTaskId) return;

    const task = tasks.find(t => t.identifier === draggedTaskId || t.uid === draggedTaskId);
    if (!task) return;

    const duration = task.dueDate && task.startDate
      ? differenceInDays(task.dueDate, task.startDate)
      : 0;

    const newStartDate = targetDate;
    const newDueDate = duration > 0 ? addDays(targetDate, duration) : targetDate;

    await updateTask(task.uid || task.identifier, {
      startDate: newStartDate,
      dueDate: newDueDate,
    });

    setDraggedTaskId(null);
  }, [draggedTaskId, tasks, updateTask]);

  // Get user IDs from task assignees
  const getUserIdsFromTask = useCallback(
    (task: Task): string[] => {
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

  // Stats
  const stats = useMemo(() => {
    const withTimeline = tasksWithDates.length;
    const completed = tasksWithDates.filter(t => t.status === 'complete').length;
    const inProgress = tasksWithDates.filter(t => t.status === 'in-progress').length;
    const overdue = tasksWithDates.filter(t => {
      if (!t.dueDate || t.status === 'complete') return false;
      const dueDate = t.dueDate instanceof Date ? t.dueDate : new Date(t.dueDate);
      return !isNaN(dueDate.getTime()) && dueDate < new Date();
    }).length;

    return { withTimeline, completed, inProgress, overdue };
  }, [tasksWithDates]);

  const selectedTask = selectedTaskId ? tasks.find(t => t.identifier === selectedTaskId) : null;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-4">
        {/* Gantt Header */}
        <GlassCard variant="subtle" size="lg" className="border border-border/50">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <GanttIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <Text variant="h6" weight="semibold">
                  {viewMode === "week"
                    ? `Week of ${format(startOfWeek(currentDate), "MMM d, yyyy")}`
                    : viewMode === "day"
                    ? `${format(currentDate, "MMM d, yyyy")} - 7 Days`
                    : format(currentDate, "MMMM yyyy")}
                </Text>
                <Text variant="caption" color="muted">
                  {stats.withTimeline} tasks • {stats.completed} complete • {stats.inProgress} in progress
                  {stats.overdue > 0 && ` • ${stats.overdue} overdue`}
                </Text>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg">
                {(["day", "week", "month"] as ViewMode[]).map((mode) => (
                  <Button
                    key={mode}
                    variant={viewMode === mode ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode(mode)}
                    className={cn(
                      "h-8 px-3 capitalize",
                      viewMode === mode && "shadow-sm"
                    )}
                  >
                    {mode === "day" && <Calendar className="h-3.5 w-3.5 mr-1.5" />}
                    {mode}
                  </Button>
                ))}
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (viewMode === "month") setViewMode("week");
                        else if (viewMode === "week") setViewMode("day");
                      }}
                      disabled={viewMode === "day"}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom In</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (viewMode === "day") setViewMode("week");
                        else if (viewMode === "week") setViewMode("month");
                      }}
                      disabled={viewMode === "month"}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom Out</TooltipContent>
                </Tooltip>
              </div>

              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={previousPeriod}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={nextPeriod}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {onAddTask && (
                <Button
                  size="sm"
                  onClick={() => setIsAddingTask(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Task
                </Button>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Stats Cards */}
        {stats.overdue > 0 && (
          <GlassCard variant="colorful" size="sm" className="border-2 border-red-500/30 bg-red-50/50 dark:bg-red-950/20">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <Text variant="body-sm" weight="semibold" className="text-red-700 dark:text-red-300">
                  {stats.overdue} Overdue Task{stats.overdue > 1 ? 's' : ''}
                </Text>
                <Text variant="caption" className="text-red-600 dark:text-red-400">
                  These tasks need immediate attention
                </Text>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Gantt Chart */}
        <Card className="p-4 sm:p-6 overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Timeline Header */}
            <div className="flex mb-4 sticky top-0 bg-background z-10 pb-2">
              {/* Task names column */}
              <div className="w-64 flex-shrink-0 pr-4">
                <Text variant="body-sm" weight="semibold" color="muted">
                  Task Name
                </Text>
              </div>

              {/* Timeline days */}
              <div className="flex-1 relative">
                <div className="flex border-b border-border">
                  {timelineRange && Array.isArray(timelineRange) && timelineRange.length > 0 && timelineRange.map((day, index) => {
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                    const isDayToday = isToday(day);
                    return (
                      <div
                        key={index}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleBarDrop(e, day)}
                        className={cn(
                          "flex-1 text-center py-2 border-l border-border min-w-[30px]",
                          "transition-colors",
                          isWeekend && "bg-muted/20",
                          isDayToday && "bg-primary/5 border-primary/30"
                        )}
                      >
                        <Text
                          variant="caption"
                          weight={isDayToday ? "semibold" : "normal"}
                          className={cn(isDayToday && "text-primary")}
                        >
                          {format(day, viewMode === "month" ? "d" : "EEE d")}
                        </Text>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Task Rows */}
            <div className="space-y-1">
              {tasksWithDates.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                  <Text variant="body" weight="medium" className="mb-2">
                    No tasks with timeline
                  </Text>
                  <Text variant="body-sm" color="muted">
                    Add start dates or due dates to see tasks on the Gantt chart
                  </Text>
                  {onAddTask && (
                    <Button
                      size="sm"
                      onClick={() => setIsAddingTask(true)}
                      className="mt-4 gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add First Task
                    </Button>
                  )}
                </div>
              ) : (
                tasksWithDates.map((task) => {
                  const barStyle = getTaskBarStyle(task);
                  const isSelected = selectedTaskId === task.identifier;
                  const isEditing = editingTaskId === task.identifier;
                  const isDragging = draggedTaskId === task.identifier;

                  return (
                    <div
                      key={task.identifier}
                      className={cn(
                        "flex items-center group rounded-lg hover:bg-muted/30 transition-colors",
                        isSelected && "bg-primary/5 ring-2 ring-primary/20",
                        isDragging && "opacity-50"
                      )}
                    >
                      {/* Task Info */}
                      <div className="w-64 flex-shrink-0 pr-4 py-2">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => setSelectedTaskId(isSelected ? null : task.identifier)}
                                  className="flex items-center gap-2 flex-1 min-w-0 text-left group/task"
                                  title={task.title}
                                >
                                  <div
                                    className={cn(
                                      "h-2 w-2 rounded-full flex-shrink-0",
                                      PRIORITY_COLORS[task.priority].split(' ')[0]
                                    )}
                                  />
                                  <Text
                                    variant="body-sm"
                                    weight="medium"
                                    className={cn(
                                      "truncate group-hover/task:text-primary transition-colors",
                                      isSelected && "text-primary"
                                    )}
                                  >
                                    {task.title}
                                  </Text>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="left">Click to view details</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingTaskId(isEditing ? null : task.identifier)}
                                  className={cn(
                                    "h-6 w-6 p-0 opacity-0 group-hover:opacity-100",
                                    isEditing && "opacity-100"
                                  )}
                                >
                                  {isEditing ? <X className="h-3 w-3" /> : <Edit2 className="h-3 w-3" />}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {isEditing ? "Close editor" : "Edit task"}
                              </TooltipContent>
                            </Tooltip>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0 h-4"
                            >
                              {task.status}
                            </Badge>
                            {task.assignees && Array.isArray(task.assignees) && task.assignees.length > 0 && (
                              <Text variant="caption" color="muted" className="text-[10px] truncate">
                                {task.assignees[0]}
                                {task.assignees.length > 1 && ` +${task.assignees.length - 1}`}
                              </Text>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Timeline Bar */}
                      <div className="flex-1 relative h-14">
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex pointer-events-none">
                          {timelineRange && Array.isArray(timelineRange) && timelineRange.length > 0 && timelineRange.map((day, index) => {
                            const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                            const isDayToday = isToday(day);
                            return (
                              <div
                                key={index}
                                className={cn(
                                  "flex-1 border-l border-border/30",
                                  isWeekend && "bg-muted/10",
                                  isDayToday && "bg-primary/5"
                                )}
                              />
                            );
                          })}
                        </div>

                        {/* Today marker */}
                        {todayPosition !== null && (
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-primary/60 z-20 pointer-events-none"
                            style={{ left: `${todayPosition}%` }}
                          >
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary" />
                          </div>
                        )}

                        {/* Task Bar */}
                        {barStyle && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                draggable
                                onDragStart={(e) => handleBarDragStart(e, task.identifier)}
                                onDragEnd={handleBarDragEnd}
                                className={cn(
                                  "absolute top-1/2 -translate-y-1/2 h-9 rounded-lg",
                                  "flex items-center px-3 gap-2",
                                  "border-2 transition-all duration-200",
                                  "cursor-move shadow-sm",
                                  "group-hover:shadow-lg group-hover:scale-y-110 group-hover:z-10",
                                  STATUS_COLORS[task.status],
                                  isSelected && "ring-2 ring-primary ring-offset-1 scale-y-110 z-10"
                                )}
                                style={barStyle}
                                onClick={() => setSelectedTaskId(task.identifier)}
                              >
                                <Grip className="h-3 w-3 text-white/70 flex-shrink-0" />
                                <Text
                                  variant="caption"
                                  className="text-white font-medium truncate text-xs"
                                >
                                  {task.title}
                                </Text>
                                {task.status === 'complete' && (
                                  <Check className="h-3 w-3 text-white flex-shrink-0 ml-auto" />
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                <div className="font-semibold">{task.title}</div>
                                <div className="text-xs">
                                  {task.startDate && format(task.startDate, "MMM d")}
                                  {task.startDate && task.dueDate && " → "}
                                  {task.dueDate && format(task.dueDate, "MMM d, yyyy")}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Drag to reschedule
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Card>

        {/* Task Editor Panel */}
        {selectedTask && (
          <GlassCard variant="colorful" size="lg" className="border-2 border-primary/30">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <Text variant="h6" weight="semibold">Task Details</Text>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTaskId(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Text variant="caption" color="muted" className="mb-1">Title</Text>
                  <Text variant="body" weight="medium">{selectedTask.title}</Text>
                </div>

                <div>
                  <Text variant="caption" color="muted" className="mb-1">Status</Text>
                  <div onClick={(e) => e.stopPropagation()}>
                    <StatusSelect
                      value={selectedTask.status}
                      onChange={(value) => updateTask(selectedTask.uid, { status: value as TaskStatus })}
                    />
                  </div>
                </div>

                <div>
                  <Text variant="caption" color="muted" className="mb-1">Priority</Text>
                  <div onClick={(e) => e.stopPropagation()}>
                    <PrioritySelect
                      value={selectedTask.priority}
                      onChange={(value) => updateTask(selectedTask.uid, { priority: value as TaskPriority })}
                    />
                  </div>
                </div>

                <div>
                  <Text variant="caption" color="muted" className="mb-1">Assignees</Text>
                  <div onClick={(e) => e.stopPropagation()}>
                    <AvatarSelectGroup
                      users={availableUsers}
                      selectedUserIds={getUserIdsFromTask(selectedTask)}
                      onSelectionChange={(userIds) => {
                        const selectedUsers = availableUsers.filter((user) => userIds.includes(user.id));
                        updateTask(selectedTask.uid, { assignees: selectedUsers.map((user) => user.name) });
                      }}
                      placeholder="Assign to..."
                      allowMultiple={true}
                    />
                  </div>
                </div>

                <div>
                  <Text variant="caption" color="muted" className="mb-1">Start Date</Text>
                  <div onClick={(e) => e.stopPropagation()}>
                    <DatePicker
                      value={selectedTask.startDate}
                      onChange={(date) => updateTask(selectedTask.uid, { startDate: date })}
                      placeholder="Set start date"
                    />
                  </div>
                </div>

                <div>
                  <Text variant="caption" color="muted" className="mb-1">Due Date</Text>
                  <div onClick={(e) => e.stopPropagation()}>
                    <DatePicker
                      value={selectedTask.dueDate}
                      onChange={(date) => updateTask(selectedTask.uid, { dueDate: date })}
                      placeholder="Set due date"
                    />
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Legend */}
        <GlassCard variant="subtle" size="sm" className="border border-border/50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <Text variant="body-sm" weight="semibold" className="mb-2">
                Status Legend
              </Text>
              <div className="flex items-center gap-4 flex-wrap">
                {Object.entries(STATUS_COLORS).map(([status, color]) => (
                  <div key={status} className="flex items-center gap-2">
                    <div className={cn("h-3 w-8 rounded", color.split(' ')[0])} />
                    <Text variant="caption" color="muted" className="capitalize">
                      {status.replace("-", " ")}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Text variant="body-sm" weight="semibold" className="mb-2">
                Priority Legend
              </Text>
              <div className="flex items-center gap-4 flex-wrap">
                {Object.entries(PRIORITY_COLORS).map(([priority, color]) => (
                  <div key={priority} className="flex items-center gap-2">
                    <div className={cn("h-3 w-3 rounded-full", color.split(' ')[0])} />
                    <Text variant="caption" color="muted" className="capitalize">
                      {priority}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </TooltipProvider>
  );
}
