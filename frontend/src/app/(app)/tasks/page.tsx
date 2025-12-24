"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { renderTasksPage } from "@/template/page/tasks.template";
import { Task, TaskStatus, TaskPriority } from "@/interfaces/task.interface";
import { toast } from "sonner";
import { useTasks } from "@/hooks/use-tasks";
import { useProjects } from "@/hooks/use-projects";
import { useUsers } from "@/hooks/use-users";
import { LoadingScreen } from "@/components/atoms/loading-screen";

export default function AllTasksPage() {
  const router = useRouter();
  const { tasks: allTasks, isLoading } = useTasks();
  const { projects } = useProjects();
  const { users } = useUsers();

  // Ensure page scrolls to top on mount/navigation
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  // Transform tasks to include project info
  const tasksWithProject: Array<Task & { projectId: string; projectName: string }> = useMemo(() => {
    return allTasks.map((task) => {
      const project = projects.find((p) => p.uid === task.projectId);
      return {
        ...task,
        projectId: task.projectId || "unassigned",
        projectName: project?.name || "Unassigned",
      };
    });
  }, [allTasks, projects]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | "all">("all");
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | "all">("all");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedTask, setSelectedTask] = useState<(Task & { projectId: string; projectName: string }) | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Get unique projects from tasks
  const projectList = useMemo(() => {
    const projectSet = new Set(tasksWithProject.map((t) => t.projectId));
    return Array.from(projectSet).map((id) => {
      const task = tasksWithProject.find((t) => t.projectId === id);
      return {
        id,
        name: task?.projectName || "Unknown Project",
      };
    });
  }, [tasksWithProject]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let filtered = [...tasksWithProject];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.identifier.toLowerCase().includes(query) ||
          task.projectName.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((task) => task.status === selectedStatus);
    }

    // Filter by priority
    if (selectedPriority !== "all") {
      filtered = filtered.filter((task) => task.priority === selectedPriority);
    }

    // Filter by project
    if (selectedProject !== "all") {
      filtered = filtered.filter((task) => task.projectId === selectedProject);
    }

    return filtered;
  }, [tasksWithProject, searchQuery, selectedStatus, selectedPriority, selectedProject]);

  // Statistics
  const stats = useMemo(() => {
    const total = tasksWithProject.length;
    const todo = tasksWithProject.filter((t) => t.status === "todo").length;
    const inProgress = tasksWithProject.filter((t) => t.status === "in-progress").length;
    const complete = tasksWithProject.filter((t) => t.status === "complete").length;
    const overdue = tasksWithProject.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "complete"
    ).length;

    return { total, todo, inProgress, complete, overdue };
  }, [tasksWithProject]);

  const handleTaskClick = (task: Task & { projectId: string; projectName: string }) => {
    setSelectedTask(task);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    // Task updates are handled by the useTasks hook
    setSelectedTask(null);
    toast.success("Task updated");
  };

  const handleTaskDelete = (taskIdentifier: string) => {
    // Task deletion is handled by the useTasks hook
    setSelectedTask(null);
    toast.success("Task deleted");
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedStatus("all");
    setSelectedPriority("all");
    setSelectedProject("all");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedStatus !== "all" ||
    selectedPriority !== "all" ||
    selectedProject !== "all";

  if (isLoading) {
    return <LoadingScreen type="tasks" />;
  }

  // Transform users to match AvatarSelectGroup/TaskDetailModal format
  const availableUsers = useMemo(() => {
    return users.map((user) => ({
      id: user.id,
      name: user.name || user.email || "Unknown",
      email: user.email || "",
      avatarUrl: user.avatar,
      role: user.role,
      status: user.status,
    }));
  }, [users]);

  return renderTasksPage({
    tasks: tasksWithProject,
    searchQuery,
    selectedStatus,
    selectedPriority,
    selectedProject,
    viewMode,
    showFilters,
    selectedTask,
    stats,
    projects: projectList,
    filteredTasks,
    hasActiveFilters,
    availableUsers,
    onSearchChange: setSearchQuery,
    onStatusChange: setSelectedStatus,
    onPriorityChange: setSelectedPriority,
    onProjectChange: setSelectedProject,
    onViewModeChange: setViewMode,
    onToggleFilters: () => setShowFilters(!showFilters),
    onClearFilters: clearFilters,
    onTaskClick: handleTaskClick,
    onTaskUpdate: handleTaskUpdate,
    onTaskDelete: handleTaskDelete,
    onCloseModal: () => setSelectedTask(null),
  });
}

