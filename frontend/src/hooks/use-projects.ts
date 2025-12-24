"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectApi } from "@/core/services/api-helpers";
import type { Project } from "@/interfaces";

const PROJECTS_QUERY_KEY = ["projects"];

export function useProjects() {
  const queryClient = useQueryClient();

  const projectsQuery = useQuery({
    queryKey: PROJECTS_QUERY_KEY,
    queryFn: () => projectApi.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const createMutation = useMutation({
    mutationFn: (input: Omit<Project, "uid">) => projectApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ uid, data }: { uid: string; data: Partial<Omit<Project, "uid">> }) =>
      projectApi.update(uid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (uid: string) => projectApi.delete(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });

  return {
    projects: projectsQuery.data || [],
    isLoading: projectsQuery.isLoading,
    error: projectsQuery.error,
    createProject: createMutation.mutateAsync,
    updateProject: updateMutation.mutateAsync,
    deleteProject: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useProject(uid: string) {
  const queryClient = useQueryClient();
  const PROJECT_QUERY_KEY = ["projects", uid];

  const projectQuery = useQuery({
    queryKey: PROJECT_QUERY_KEY,
    queryFn: () => projectApi.getByUid(uid),
    enabled: !!uid,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Omit<Project, "uid">>) => projectApi.update(uid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
    },
  });

  return {
    project: projectQuery.data,
    isLoading: projectQuery.isLoading,
    error: projectQuery.error,
    updateProject: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}

