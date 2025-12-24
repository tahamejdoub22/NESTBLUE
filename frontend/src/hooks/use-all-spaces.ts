"use client";

import { useQuery } from "@tanstack/react-query";
import { teamSpacesApi } from "@/core/services/api-helpers";

const ALL_SPACES_QUERY_KEY = ["all-spaces"];

/**
 * Hook to get all team spaces with their projects
 */
export function useAllSpaces() {
  const spacesQuery = useQuery({
    queryKey: ALL_SPACES_QUERY_KEY,
    queryFn: () => teamSpacesApi.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    spaces: spacesQuery.data || [],
    isLoading: spacesQuery.isLoading,
    error: spacesQuery.error,
  };
}

