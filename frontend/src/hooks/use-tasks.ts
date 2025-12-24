"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskApi } from "@/core/services/api-helpers";
import type { Task } from "@/interfaces";

const TASKS_QUERY_KEY = ["tasks"];
const TASKS_BY_PROJECT_QUERY_KEY = (projectId: string) => ["tasks", "project", projectId];

export function useTasks(projectId?: string) {
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: projectId ? TASKS_BY_PROJECT_QUERY_KEY(projectId) : TASKS_QUERY_KEY,
    queryFn: () => (projectId ? taskApi.getByProject(projectId) : taskApi.getAll()),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const createMutation = useMutation({
    mutationFn: (input: Omit<Task, "uid" | "identifier">) => taskApi.create(input),
    onSuccess: (data, variables) => {
      // Always invalidate the general tasks query
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      
      // Invalidate project-specific tasks query
      // Use projectId from hook, created task data, or input variables
      const taskProjectId = data.projectId || variables.projectId || projectId;
      if (taskProjectId) {
        queryClient.invalidateQueries({ queryKey: TASKS_BY_PROJECT_QUERY_KEY(taskProjectId) });
      }
      
      // Also invalidate if projectId was provided to hook
      if (projectId && projectId !== taskProjectId) {
        queryClient.invalidateQueries({ queryKey: TASKS_BY_PROJECT_QUERY_KEY(projectId) });
      }
      
      // Invalidate sprint tasks if task has sprintId
      const taskSprintId = data.sprintId || variables.sprintId;
      if (taskSprintId) {
        // Invalidate the specific sprint tasks query
        queryClient.invalidateQueries({ 
          queryKey: ["sprints", taskSprintId, "tasks"],
          exact: false // Also invalidate any nested queries
        });
        // Also invalidate the sprint itself to refresh task counts
        queryClient.invalidateQueries({ 
          queryKey: ["sprints", taskSprintId],
          exact: false
        });
      }
      
      // Invalidate all sprint queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["sprints"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: Partial<Omit<Task, "uid" | "identifier">> }) => taskApi.update(uid, data),
    onSuccess: (data) => {
      // Always invalidate the general tasks query
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      
      // Invalidate project-specific tasks query
      // Use projectId from updated task data, input data, or hook parameter
      const taskProjectId = data?.projectId || (data as any)?.projectId || projectId;
      if (taskProjectId) {
        queryClient.invalidateQueries({ queryKey: TASKS_BY_PROJECT_QUERY_KEY(taskProjectId) });
      }
      
      // Also invalidate if projectId was provided to hook
      if (projectId && projectId !== taskProjectId) {
        queryClient.invalidateQueries({ queryKey: TASKS_BY_PROJECT_QUERY_KEY(projectId) });
      }
      
      // Invalidate sprint tasks if task has sprintId
      const taskSprintId = data?.sprintId || (data as any)?.sprintId;
      if (taskSprintId) {
        queryClient.invalidateQueries({ queryKey: ["sprints", taskSprintId, "tasks"] });
      }
      
      // Invalidate all sprint queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["sprints"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (uid: string) => taskApi.delete(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: TASKS_BY_PROJECT_QUERY_KEY(projectId) });
      }
      // Invalidate all sprint tasks queries (we don't know which sprint the task belonged to)
      queryClient.invalidateQueries({ queryKey: ["sprints"] });
    },
  });

  return {
    tasks: tasksQuery.data || [],
    isLoading: tasksQuery.isLoading,
    error: tasksQuery.error,
    createTask: createMutation.mutateAsync,
    updateTask: updateMutation.mutateAsync,
    deleteTask: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

