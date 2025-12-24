"use client";

import { useQueries } from "@tanstack/react-query";
import { useProjects } from "./use-projects";
import { teamSpacesApi } from "@/core/services/api-helpers";

/**
 * Hook to get all team spaces across all projects
 */
export function useAllTeamSpaces() {
  const { projects } = useProjects();

  const spacesQueries = useQueries({
    queries: projects.map((project) => ({
      queryKey: ["team-spaces", project.uid],
      queryFn: () => teamSpacesApi.getAll(project.uid),
      enabled: !!project.uid,
      staleTime: 1000 * 60 * 5,
    })),
  });

  const allSpaces = spacesQueries.flatMap((query, index) =>
    (query.data || []).map((space: any) => ({
      ...space,
      projectUid: projects[index]?.uid,
    }))
  );

  const isLoading = spacesQueries.some((query) => query.isLoading);

  // Group spaces by project
  const spacesByProject = projects.reduce((acc, project, index) => {
    const query = spacesQueries[index];
    acc[project.uid] = query?.data || [];
    return acc;
  }, {} as Record<string, any[]>);

  return {
    allSpaces,
    spacesByProject,
    isLoading,
  };
}

