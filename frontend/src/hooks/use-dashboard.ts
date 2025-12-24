"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/core/services/api-helpers";
import type { DashboardData } from "@/interfaces";

const DASHBOARD_QUERY_KEY = ["dashboard"];

export function useDashboard() {
  const dashboardQuery = useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: () => dashboardApi.getData(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
    refetchOnWindowFocus: false, // Disable refetch on window focus for better performance
    refetchOnMount: true, // Only refetch on mount if data is stale
    gcTime: 1000 * 60 * 10, // Keep cache for 10 minutes
  });

  return {
    data: dashboardQuery.data,
    isLoading: dashboardQuery.isLoading,
    error: dashboardQuery.error,
    refetch: dashboardQuery.refetch,
  };
}



