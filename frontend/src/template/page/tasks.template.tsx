"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/layouts/page-header";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { TaskListItem } from "@/components/molecules/task-list-item";
import { TaskDetailModal } from "@/components/molecules/task-detail-modal";
import { Modal } from "@/components/molecules/modal";
import { Task, TaskStatus, TaskPriority } from "@/interfaces/task.interface";
import {
  Search,
  Filter,
  Plus,
  List,
  Grid,
  Calendar,
  CheckSquare2,
  X,
  AlertCircle,
  Clock,
  CheckCircle2,
  Circle,
  FolderKanban,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, transitions } from "@/lib/motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/atoms/tooltip";

export interface TasksPageTemplateProps {
  tasks: Array<Task & { projectId: string; projectName: string }>;
  searchQuery: string;
  selectedStatus: TaskStatus | "all";
  selectedPriority: TaskPriority | "all";
  selectedProject: string;
  viewMode: "list" | "grid";
  showFilters: boolean;
  selectedTask: (Task & { projectId: string; projectName: string }) | null;
  stats: {
    total: number;
    todo: number;
    inProgress: number;
    complete: number;
    overdue: number;
  };
  projects: Array<{ id: string; name: string }>;
  filteredTasks: Array<Task & { projectId: string; projectName: string }>;
  hasActiveFilters: boolean;
  availableUsers?: Array<{
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    role?: string;
    status?: "online" | "offline" | "away" | "busy";
  }>;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: TaskStatus | "all") => void;
  onPriorityChange: (value: TaskPriority | "all") => void;
  onProjectChange: (value: string) => void;
  onViewModeChange: (mode: "list" | "grid") => void;
  onToggleFilters: () => void;
  onClearFilters: () => void;
  onTaskClick: (task: Task & { projectId: string; projectName: string }) => void;
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (taskIdentifier: string) => void;
  onCloseModal: () => void;
}

const STATUS_CONFIG: Record<TaskStatus | "all", { label: string; color: string; icon: any }> = {
  all: { label: "All", color: "text-muted-foreground", icon: CheckSquare2 },
  todo: { label: "To Do", color: "text-blue-600 dark:text-blue-400", icon: Circle },
  "in-progress": { label: "In Progress", color: "text-amber-600 dark:text-amber-400", icon: Clock },
  complete: { label: "Complete", color: "text-emerald-600 dark:text-emerald-400", icon: CheckCircle2 },
  backlog: { label: "Backlog", color: "text-muted-foreground", icon: FolderKanban },
};

const PRIORITY_CONFIG: Record<TaskPriority | "all", { label: string; color: string }> = {
  all: { label: "All", color: "text-muted-foreground" },
  low: { label: "Low", color: "text-blue-600 dark:text-blue-400" },
  medium: { label: "Medium", color: "text-amber-600 dark:text-amber-400" },
  high: { label: "High", color: "text-orange-600 dark:text-orange-400" },
  urgent: { label: "Urgent", color: "text-red-600 dark:text-red-400" },
};

export function renderTasksPage(props: TasksPageTemplateProps) {
  const {
    tasks,
    searchQuery,
    selectedStatus,
    selectedPriority,
    selectedProject,
    viewMode,
    showFilters,
    selectedTask,
    stats,
    projects,
    filteredTasks,
    hasActiveFilters,
    availableUsers = [],
    onSearchChange,
    onStatusChange,
    onPriorityChange,
    onProjectChange,
    onViewModeChange,
    onToggleFilters,
    onClearFilters,
    onTaskClick,
    onTaskUpdate,
    onTaskDelete,
    onCloseModal,
  } = props;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="relative min-h-screen bg-[#F7F9FC] dark:bg-background"
    >
      <div className="p-6 max-w-[1920px] mx-auto min-h-screen">
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          className="col-span-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 mb-2"
        >
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-1">
              All Tasks
            </h1>
            <p className="text-sm text-muted-foreground">
              {stats.total} total tasks across all projects
            </p>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFilters}
              className="h-8 px-3 gap-2 hover:bg-muted/50 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span className="text-sm">Filters</span>
              {hasActiveFilters && (
                <Badge
                  variant="primary"
                  className="h-5 min-w-5 px-1.5 text-[10px] font-bold"
                >
                  {[
                    searchQuery.trim() !== "",
                    selectedStatus !== "all",
                    selectedPriority !== "all",
                    selectedProject !== "all",
                  ].filter(Boolean).length}
                </Badge>
              )}
            </Button>
            <div className="flex items-center gap-1 border border-border/40 rounded-lg p-1 bg-background">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "list" ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => onViewModeChange("list")}
                    className="h-8 w-8 p-0"
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>List view</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "grid" ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => onViewModeChange("grid")}
                    className="h-8 w-8 p-0"
                    aria-label="Grid view"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Grid view</TooltipContent>
              </Tooltip>
            </div>
            <Button
              size="sm"
              className="h-8 px-3 gap-2 bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md transition-all"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm">New Task</span>
            </Button>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          variants={fadeInUp}
          transition={{ ...transitions.default, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mb-4"
        >
          <Card className="border border-border/40 bg-card hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Total Tasks</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <CheckSquare2 className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/40 bg-card hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">To Do</p>
                  <p className="text-2xl font-bold text-foreground">{stats.todo}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <Circle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/40 bg-card hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">In Progress</p>
                  <p className="text-2xl font-bold text-foreground">{stats.inProgress}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/40 bg-card hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Complete</p>
                  <p className="text-2xl font-bold text-foreground">{stats.complete}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/40 bg-card hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Overdue</p>
                  <p className="text-2xl font-bold text-destructive">{stats.overdue}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center border border-destructive/20">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border border-border/40 bg-card mb-4">
                <CardHeader className="pb-3 px-4 pt-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Filter className="h-4 w-4 text-primary" />
                      Filters
                    </CardTitle>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearFilters}
                        className="h-7 text-xs gap-1.5"
                      >
                        <X className="h-3.5 w-3.5" />
                        Clear all
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Search className="h-3.5 w-3.5 text-muted-foreground" />
                        Search
                      </label>
                      <Input
                        placeholder="Search tasks..."
                        leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="h-9 border-border/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <CheckSquare2 className="h-3.5 w-3.5 text-muted-foreground" />
                        Status
                      </label>
                      <Select value={selectedStatus} onValueChange={onStatusChange}>
                        <SelectTrigger className="h-9 border-border/40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="complete">Complete</SelectItem>
                          <SelectItem value="backlog">Backlog</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                        Priority
                      </label>
                      <Select value={selectedPriority} onValueChange={onPriorityChange}>
                        <SelectTrigger className="h-9 border-border/40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priorities</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <FolderKanban className="h-3.5 w-3.5 text-muted-foreground" />
                        Project
                      </label>
                      <Select value={selectedProject} onValueChange={onProjectChange}>
                        <SelectTrigger className="h-9 border-border/40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Projects</SelectItem>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tasks List/Grid */}
        {filteredTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border border-border/40 bg-card">
              <CardContent className="p-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <CheckSquare2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {hasActiveFilters ? "No tasks match your filters" : "No tasks found"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                    {hasActiveFilters
                      ? "Try adjusting your filters to see more tasks"
                      : "Create a new task to get started"}
                  </p>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={onClearFilters} className="gap-2">
                      <X className="h-4 w-4" />
                      Clear filters
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            variants={fadeInUp}
            transition={{ ...transitions.default, delay: 0.2 }}
            className={cn(
              "space-y-2",
              viewMode === "grid" && "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2"
            )}
          >
            <AnimatePresence>
              {filteredTasks.map((task, index) => (
                <motion.div
                  key={task.identifier}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                  className={cn(viewMode === "grid" && "h-full")}
                >
                  <TaskListItem
                    task={task}
                    showProject={true}
                    projectName={task.projectName}
                    onClick={() => onTaskClick(task)}
                    className={cn(viewMode === "grid" && "h-full")}
                    availableUsers={availableUsers}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Task Detail Modal */}
        {selectedTask && (
          <Modal.Provider defaultOpen={true} onOpenChange={(open) => !open && onCloseModal()}>
            <TaskDetailModal
              task={selectedTask}
              availableUsers={availableUsers}
              onTaskUpdate={onTaskUpdate}
              onTaskDelete={onTaskDelete}
            />
          </Modal.Provider>
        )}
      </div>
    </motion.div>
  );
}
