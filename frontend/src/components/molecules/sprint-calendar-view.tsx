// src/components/molecules/sprint-calendar-view.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { Text } from "@/components/atoms/text";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import { Card } from "@/components/atoms/card";
import { Input } from "@/components/atoms/input";
import { Task, TaskStatus, TaskPriority } from "@/interfaces/task.interface";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  X,
  Sparkles,
  Clock,
  AlertCircle
} from "lucide-react";
import { cn, generateUniqueId } from "@/lib/utils";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isPast,
  isFuture
} from "date-fns";
import { DatePicker } from "@/components/molecules/date-picker";
import { PrioritySelect } from "@/components/molecules/priority-select";
import { StatusSelect } from "@/components/molecules/status-select";
import { AvatarSelectGroup } from "@/components/molecules/avatar-select-group";
import { DEFAULT_AVAILABLE_USERS, TASK_DEFAULTS } from "@/constants/sprint.constants";
import { User } from "@/components/molecules/avatar-select-group";

interface SprintCalendarViewProps {
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
  urgent: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-blue-500",
};

const STATUS_COLORS = {
  todo: "border-l-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20",
  "in-progress": "border-l-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950/20",
  complete: "border-l-green-500 hover:bg-green-50 dark:hover:bg-green-950/20",
  backlog: "border-l-gray-500 hover:bg-gray-50 dark:hover:bg-gray-950/20",
};

export function SprintCalendarView({
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
}: SprintCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("medium");
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>("todo");
  const [newTaskAssignees, setNewTaskAssignees] = useState<string[]>([]);

  // Get calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};

    tasks.forEach((task) => {
      if (task.dueDate) {
        try {
          // Handle both Date objects and ISO strings from backend
          const dueDate = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
          if (!isNaN(dueDate.getTime())) {
            const dateKey = format(dueDate, "yyyy-MM-dd");
            if (!grouped[dateKey]) {
              grouped[dateKey] = [];
            }
            grouped[dateKey].push(task);
          }
        } catch (error) {
          console.warn("Invalid date for task:", task.identifier, task.dueDate);
        }
      }
    });

    return grouped;
  }, [tasks]);

  // Get tasks for selected date
  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return [];
    try {
      const dateKey = format(selectedDate, "yyyy-MM-dd");
      return (tasksByDate[dateKey] || []).filter(Boolean);
    } catch (error) {
      console.warn("Error computing selectedDateTasks:", error);
      return [];
    }
  }, [selectedDate, tasksByDate]);

  // Stats
  const stats = useMemo(() => {
    const tasksWithDates = tasks.filter(t => t.dueDate);
    const overdueTasks = tasksWithDates.filter(t =>
      t.dueDate && isPast(t.dueDate) && t.status !== 'complete'
    );
    const upcomingTasks = tasksWithDates.filter(t =>
      t.dueDate && isFuture(t.dueDate) && t.status !== 'complete'
    );

    return {
      total: tasksWithDates.length,
      overdue: overdueTasks.length,
      upcoming: upcomingTasks.length,
      completed: tasksWithDates.filter(t => t.status === 'complete').length
    };
  }, [tasks]);

  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setSelectedTask(null);
    setIsAddingTask(false);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsAddingTask(false);
  };

  const startAddingTask = () => {
    setIsAddingTask(true);
    setSelectedTask(null);
    setNewTaskTitle("");
    setNewTaskPriority("medium");
    setNewTaskStatus("todo");
    setNewTaskAssignees([]);
  };

  const cancelAddingTask = () => {
    setIsAddingTask(false);
    setNewTaskTitle("");
  };

  const saveNewTask = useCallback(() => {
    if (!newTaskTitle.trim() || !selectedDate) return;

    const selectedUsers = availableUsers.filter((user) => newTaskAssignees.includes(user.id));

    const newTask: Omit<Task, "uid" | "identifier"> = {
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      status: newTaskStatus,
      assignees: selectedUsers.map((user) => user.name),
      dueDate: selectedDate,
      subtasks: [],
      comments: [],
      attachments: TASK_DEFAULTS.attachments,
    };

    if (onAddTask) {
      onAddTask(newTask);
    } else if (onTaskUpdate) {
      const taskWithId: Task = {
        ...newTask,
        uid: TASK_DEFAULTS.uid,
        identifier: generateUniqueId()
      };
      onTaskUpdate([...tasks, taskWithId]);
    }

    cancelAddingTask();
  }, [newTaskTitle, selectedDate, newTaskPriority, newTaskStatus, newTaskAssignees, availableUsers, onAddTask, onTaskUpdate, tasks]);

  const updateTask = useCallback(async (updatedTask: Task) => {
    const task = tasks.find(t => t.identifier === updatedTask.identifier || t.uid === updatedTask.uid);
    if (!task) return;
    
    // Use backend API if available
    if (onTaskStatusChange && task.uid && updatedTask.status !== task.status) {
      try {
        await onTaskStatusChange(task.uid, updatedTask.status);
      } catch (error) {
        console.error("Failed to update task:", error);
      }
    } else if (onTaskUpdate) {
      // Fallback to local state
      const updatedTasks = tasks.map(t => 
        t.identifier === updatedTask.identifier || t.uid === updatedTask.uid ? updatedTask : t
      );
      onTaskUpdate(updatedTasks);
    }
  }, [tasks, onTaskUpdate, onTaskStatusChange]);

  const deleteTask = useCallback(async (taskIdentifier: string) => {
    const task = tasks.find(t => t.identifier === taskIdentifier || t.uid === taskIdentifier);
    if (!task) return;
    
    if (onTaskDelete && task.uid) {
      // Use backend API
      try {
        await onTaskDelete(task.uid);
        setSelectedTask(null);
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    } else if (onTaskUpdate) {
      // Fallback to local state
      const updatedTasks = tasks.filter(t => 
        t.identifier !== taskIdentifier && t.uid !== taskIdentifier
      );
      onTaskUpdate(updatedTasks);
      setSelectedTask(null);
    }
  }, [tasks, onTaskUpdate, onTaskDelete]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Calendar - Takes 2 columns */}
      <div className="lg:col-span-2 space-y-4">
        {/* Calendar Header */}
        <Card className="p-4 sm:p-5 border-border/60 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <CalendarIcon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <Text variant="h6" weight="semibold">
                  {format(currentDate, "MMMM yyyy")}
                </Text>
                <Text variant="caption" color="muted">
                  {stats.total} tasks scheduled
                </Text>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {stats.overdue > 0 && (
                <Badge variant="destructive" className="gap-1.5 border-0">
                  <AlertCircle className="h-3 w-3" />
                  {stats.overdue} overdue
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="border-border/60"
              >
                Today
              </Button>
              <div className="flex items-center gap-0.5 border border-border/60 rounded-md overflow-hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={previousMonth}
                  className="rounded-none border-0 h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="h-6 w-px bg-border/60" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextMonth}
                  className="rounded-none border-0 h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Calendar Grid */}
        <Card className="p-4 sm:p-6 border-border/60 bg-card/50 backdrop-blur-sm">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => (
              <div key={day} className={cn(
                "text-center py-2.5",
                (idx === 0 || idx === 6) && "text-muted-foreground"
              )}>
                <Text variant="body-sm" weight="semibold" color={idx === 0 || idx === 6 ? "muted" : "default"}>
                  {day}
                </Text>
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const dayTasks = tasksByDate[dateKey] || [];
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isDayToday = isToday(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const hasOverdueTasks = dayTasks.some(t => isPast(day) && t.status !== 'complete');

              return (
                <button
                  key={dateKey}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    "min-h-[100px] sm:min-h-[120px] p-2.5 sm:p-3 rounded-lg border transition-all duration-200 group",
                    "relative overflow-hidden",
                    "hover:border-primary/40 hover:bg-accent/30",
                    isCurrentMonth
                      ? "bg-card border-border/40"
                      : "bg-muted/30 border-muted/30 opacity-50",
                    isDayToday && "border-primary/60 bg-primary/5 ring-1 ring-primary/20",
                    isSelected && "border-primary bg-primary/10 ring-2 ring-primary/30",
                    hasOverdueTasks && !isDayToday && "border-destructive/40 bg-destructive/5"
                  )}
                >
                  {/* Day Number */}
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-md text-sm font-medium transition-colors",
                        isDayToday && "bg-primary text-primary-foreground font-semibold",
                        !isDayToday && isCurrentMonth && "text-foreground group-hover:bg-accent",
                        !isDayToday && !isCurrentMonth && "text-muted-foreground"
                      )}
                    >
                      {format(day, "d")}
                    </div>
                    {dayTasks.length > 0 && (
                      <Badge
                        variant={isDayToday ? "default" : "secondary"}
                        className={cn(
                          "text-[10px] h-5 px-1.5 font-medium",
                          isDayToday && "bg-primary/90"
                        )}
                      >
                        {dayTasks.length}
                      </Badge>
                    )}
                  </div>

                  {/* Tasks for this day */}
                  <div className="space-y-1 text-left">
                    {dayTasks.slice(0, 2).map((task) => (
                      <div
                        key={task.identifier}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDayClick(day);
                          handleTaskClick(task);
                        }}
                        className={cn(
                          "text-[11px] p-1.5 rounded-md border-l-2 transition-colors cursor-pointer",
                          "hover:bg-accent/50",
                          "bg-card/60",
                          STATUS_COLORS[task.status]
                        )}
                        title={task.title}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", PRIORITY_COLORS[task.priority])} />
                          <Text variant="caption" weight="medium" className="truncate flex-1 text-xs">
                            {task.title}
                          </Text>
                        </div>
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className={cn(
                        "text-[10px] font-medium text-center py-1 px-1.5 rounded",
                        "bg-muted/40 text-muted-foreground",
                        "group-hover:bg-primary/10 group-hover:text-primary transition-colors"
                      )}>
                        +{dayTasks.length - 2} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Side Panel - Task Details/Add */}
      <div className="space-y-4">
        {/* Selected Date Info */}
        {selectedDate && (
          <Card className="p-4 sm:p-5 border-border/60 bg-card/50 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Text variant="h6" weight="semibold">
                    {format(selectedDate, "EEEE")}
                  </Text>
                  <Text variant="body-sm" color="muted">
                    {format(selectedDate, "MMMM d, yyyy")}
                  </Text>
                </div>
                <Button
                  size="sm"
                  onClick={startAddingTask}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Task
                </Button>
              </div>

              {/* Add Task Form */}
              {isAddingTask && (
                <div className="space-y-3 pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <Text variant="body-sm" weight="semibold">New Task</Text>
                  </div>

                  <Input
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Task title..."
                    className="w-full"
                    autoFocus
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Text variant="caption" color="muted" className="mb-1">Priority</Text>
                      <PrioritySelect
                        value={newTaskPriority}
                        onChange={(value) => setNewTaskPriority(value as TaskPriority)}
                      />
                    </div>
                    <div>
                      <Text variant="caption" color="muted" className="mb-1">Status</Text>
                      <StatusSelect
                        value={newTaskStatus}
                        onChange={(value) => setNewTaskStatus(value as TaskStatus)}
                      />
                    </div>
                  </div>

                  <div>
                    <Text variant="caption" color="muted" className="mb-1">Assignees</Text>
                    <AvatarSelectGroup
                      users={availableUsers}
                      selectedUserIds={newTaskAssignees}
                      onSelectionChange={setNewTaskAssignees}
                      placeholder="Assign to..."
                      allowMultiple={true}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={saveNewTask}
                      disabled={!newTaskTitle.trim()}
                      className="flex-1"
                    >
                      Create Task
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelAddingTask}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Task List for Selected Date */}
              {!isAddingTask && selectedDateTasks && Array.isArray(selectedDateTasks) && selectedDateTasks.length > 0 && (
                <div className="space-y-2 pt-3 border-t">
                  <Text variant="body-sm" weight="semibold">
                    {selectedDateTasks.length} {selectedDateTasks.length === 1 ? 'task' : 'tasks'}
                  </Text>
                  {selectedDateTasks.map((task) => (
                    <button
                      key={task.identifier}
                      onClick={() => handleTaskClick(task)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border-l-2 transition-all",
                        "hover:bg-accent/50",
                        STATUS_COLORS[task.status],
                        selectedTask?.identifier === task.identifier && "ring-2 ring-primary/40 bg-primary/5"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={cn("h-2 w-2 rounded-full", PRIORITY_COLORS[task.priority])} />
                            <Text variant="body-sm" weight="medium" className="truncate">
                              {task.title}
                            </Text>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {task.status}
                            </Badge>
                            {task.assignees && Array.isArray(task.assignees) && task.assignees.length > 0 && (
                              <Text variant="caption" color="muted" className="text-[10px]">
                                {task.assignees[0]}
                                {task.assignees.length > 1 && ` +${task.assignees.length - 1}`}
                              </Text>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!isAddingTask && (!selectedDateTasks || !Array.isArray(selectedDateTasks) || selectedDateTasks.length === 0) && (
                <div className="text-center py-6 border-t">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <Text variant="body-sm" color="muted">
                    No tasks for this date
                  </Text>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Task Details Editor */}
        {selectedTask && !isAddingTask && (
          <Card className="p-4 sm:p-5 border-border/60 bg-card/50 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Text variant="h6" weight="semibold">Task Details</Text>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTask(null)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <Text variant="caption" color="muted" className="mb-1">Title</Text>
                  <Input
                    value={selectedTask.title}
                    onChange={(e) => updateTask({ ...selectedTask, title: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Text variant="caption" color="muted" className="mb-1">Priority</Text>
                    <PrioritySelect
                      value={selectedTask.priority}
                      onChange={async (value) => {
                        const updatedTask = { ...selectedTask, priority: value as TaskPriority };
                        updateTask(updatedTask);
                        // Also update via backend if handler available
                        if (onTaskPriorityChange && selectedTask.uid) {
                          try {
                            await onTaskPriorityChange(selectedTask.uid, value);
                          } catch (error) {
                            console.error("Failed to update task priority:", error);
                          }
                        }
                      }}
                    />
                  </div>
                  <div>
                    <Text variant="caption" color="muted" className="mb-1">Status</Text>
                    <StatusSelect
                      value={selectedTask.status}
                      onChange={async (value) => {
                        const updatedTask = { ...selectedTask, status: value as TaskStatus };
                        updateTask(updatedTask);
                        // Also update via backend if handler available
                        if (onTaskStatusChange && selectedTask.uid) {
                          try {
                            await onTaskStatusChange(selectedTask.uid, value);
                          } catch (error) {
                            console.error("Failed to update task status:", error);
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                <div>
                  <Text variant="caption" color="muted" className="mb-1">Due Date</Text>
                  <DatePicker
                    value={selectedTask.dueDate}
                    onChange={(date) => {
                      const updatedTask = { ...selectedTask, dueDate: date };
                      updateTask(updatedTask);
                      // Also update via backend if handler available
                      if (onTaskDateChange && selectedTask.uid) {
                        onTaskDateChange(selectedTask.uid, date).catch(console.error);
                      }
                    }}
                    placeholder="Set due date"
                    minDate={minDate}
                    maxDate={maxDate}
                  />
                </div>

                <div>
                  <Text variant="caption" color="muted" className="mb-1">Assignees</Text>
                  <AvatarSelectGroup
                    users={availableUsers}
                    selectedUserIds={(selectedTask as any).assigneeIds || availableUsers
                      .filter((user) => selectedTask.assignees.includes(user.name || user.email))
                      .map((user) => user.id)}
                    onSelectionChange={async (userIds) => {
                      const selectedUsers = availableUsers.filter((user) => userIds.includes(user.id));
                      const updatedTask = { 
                        ...selectedTask, 
                        assignees: selectedUsers.map((user) => user.name || user.email),
                        assigneeIds: userIds,
                      };
                      updateTask(updatedTask);
                      // Also update via backend if handler available
                      if (onTaskAssigneesChange && selectedTask.uid) {
                        try {
                          await onTaskAssigneesChange(selectedTask.uid, userIds);
                        } catch (error) {
                          console.error("Failed to update task assignees:", error);
                        }
                      }
                    }}
                    placeholder="Assign to..."
                    allowMultiple={true}
                  />
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteTask(selectedTask.identifier)}
                  className="w-full"
                >
                  Delete Task
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Stats Card */}
        <Card className="p-4 border-border/60 bg-card/50 backdrop-blur-sm">
          <Text variant="body-sm" weight="semibold" className="mb-3">Overview</Text>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between py-1">
              <Text variant="caption" color="muted">Total Tasks</Text>
              <Badge variant="secondary" className="border-0">{stats.total}</Badge>
            </div>
            <div className="flex items-center justify-between py-1">
              <Text variant="caption" color="muted">Completed</Text>
              <Badge className="bg-green-500 border-0">{stats.completed}</Badge>
            </div>
            <div className="flex items-center justify-between py-1">
              <Text variant="caption" color="muted">Upcoming</Text>
              <Badge className="bg-blue-500 border-0">{stats.upcoming}</Badge>
            </div>
            {stats.overdue > 0 && (
              <div className="flex items-center justify-between py-1">
                <Text variant="caption" color="muted">Overdue</Text>
                <Badge variant="destructive" className="border-0">{stats.overdue}</Badge>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
