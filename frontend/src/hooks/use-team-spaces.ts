"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teamSpacesApi } from "@/core/services/api-helpers";

const TEAM_SPACES_QUERY_KEY = (projectUid: string) => ["team-spaces", projectUid];
const TEAM_SPACE_QUERY_KEY = (id: string) => ["team-space", id];

export function useTeamSpaces(projectUid: string) {
  const queryClient = useQueryClient();

  const spacesQuery = useQuery({
    queryKey: TEAM_SPACES_QUERY_KEY(projectUid),
    queryFn: () => teamSpacesApi.getAll(projectUid),
    enabled: !!projectUid,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const createMutation = useMutation({
    mutationFn: (input: { name: string; description?: string; memberIds?: string[]; color?: string; icon?: string }) =>
      teamSpacesApi.create(projectUid, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_SPACES_QUERY_KEY(projectUid) });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ name: string; description?: string; memberIds?: string[]; color?: string; icon?: string; isActive?: boolean }> }) =>
      teamSpacesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_SPACES_QUERY_KEY(projectUid) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => teamSpacesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_SPACES_QUERY_KEY(projectUid) });
    },
  });

  return {
    spaces: spacesQuery.data || [],
    isLoading: spacesQuery.isLoading,
    error: spacesQuery.error,
    createSpace: createMutation.mutateAsync,
    updateSpace: updateMutation.mutateAsync,
    deleteSpace: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useTeamSpace(id: string) {
  const queryClient = useQueryClient();

  const spaceQuery = useQuery({
    queryKey: TEAM_SPACE_QUERY_KEY(id),
    queryFn: () => teamSpacesApi.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  return {
    space: spaceQuery.data,
    isLoading: spaceQuery.isLoading,
    error: spaceQuery.error,
  };
}

