"use client";

import { memo } from "react";
import { renderProjectStatistics } from "@/template/component/organisms/project-statistics.template";
import { ProjectStatistics as ProjectStatisticsType, DashboardData } from "@/interfaces/dashboard.interface";

export interface ProjectStatisticsProps {
  data: ProjectStatisticsType;
  dashboardData?: DashboardData;
  className?: string;
}

export const ProjectStatistics = memo(function ProjectStatistics({ data, dashboardData, className }: ProjectStatisticsProps) {
  return renderProjectStatistics({ data, dashboardData, className });
});

