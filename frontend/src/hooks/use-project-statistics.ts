"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/core/services/api-helpers";
import type { ProjectStatistics } from "@/interfaces";

const PROJECT_STATISTICS_QUERY_KEY = (projectId?: string) => 
  projectId ? ["project-statistics", projectId] : ["project-statistics"];

export function useProjectStatistics(projectId?: string) {
  const projectStatisticsQuery = useQuery({
    queryKey: PROJECT_STATISTICS_QUERY_KEY(projectId),
    queryFn: () => dashboardApi.getProjectStatistics(projectId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  });

  return {
    data: projectStatisticsQuery.data,
    isLoading: projectStatisticsQuery.isLoading,
    error: projectStatisticsQuery.error,
    refetch: projectStatisticsQuery.refetch,
  };
}



