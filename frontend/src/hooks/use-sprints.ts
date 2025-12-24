"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sprintApi } from "@/core/services/api-helpers";
import type { Sprint, Task } from "@/interfaces";

const SPRINTS_QUERY_KEY = ["sprints"];
const SPRINTS_BY_PROJECT_QUERY_KEY = (projectId: string) => ["sprints", "project", projectId];
const SPRINT_TASKS_QUERY_KEY = (sprintId: string) => ["sprints", sprintId, "tasks"];

export function useSprints(projectId?: string) {
  const queryClient = useQueryClient();

  const sprintsQuery = useQuery({
    queryKey: projectId ? SPRINTS_BY_PROJECT_QUERY_KEY(projectId) : SPRINTS_QUERY_KEY,
    queryFn: () => (projectId ? sprintApi.getByProject(projectId) : sprintApi.getAll()),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const createMutation = useMutation({
    mutationFn: (input: Partial<Sprint>) => sprintApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SPRINTS_QUERY_KEY });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: SPRINTS_BY_PROJECT_QUERY_KEY(projectId) });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Sprint> }) =>
      sprintApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SPRINTS_QUERY_KEY });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: SPRINTS_BY_PROJECT_QUERY_KEY(projectId) });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sprintApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SPRINTS_QUERY_KEY });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: SPRINTS_BY_PROJECT_QUERY_KEY(projectId) });
      }
    },
  });

  return {
    sprints: sprintsQuery.data || [],
    isLoading: sprintsQuery.isLoading,
    error: sprintsQuery.error,
    createSprint: createMutation.mutateAsync,
    updateSprint: updateMutation.mutateAsync,
    deleteSprint: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useSprint(id: string) {
  const queryClient = useQueryClient();
  const SPRINT_QUERY_KEY = ["sprints", id];

  const sprintQuery = useQuery({
    queryKey: SPRINT_QUERY_KEY,
    queryFn: () => sprintApi.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Sprint>) => sprintApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SPRINT_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: SPRINTS_QUERY_KEY });
    },
  });

  return {
    sprint: sprintQuery.data,
    isLoading: sprintQuery.isLoading,
    error: sprintQuery.error,
    updateSprint: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

export function useSprintTasks(sprintId: string) {
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: SPRINT_TASKS_QUERY_KEY(sprintId),
    queryFn: () => sprintApi.getTasks(sprintId),
    enabled: !!sprintId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  return {
    tasks: tasksQuery.data || [],
    isLoading: tasksQuery.isLoading,
    error: tasksQuery.error,
    refetch: () => queryClient.invalidateQueries({ queryKey: SPRINT_TASKS_QUERY_KEY(sprintId) }),
  };
}



