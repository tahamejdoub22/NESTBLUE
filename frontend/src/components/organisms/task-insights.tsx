"use client";

import { memo } from "react";
import { renderTaskInsights } from "@/template/component/organisms/task-insights.template";
import { TaskInsights as TaskInsightsType } from "@/interfaces/dashboard.interface";

export interface TaskInsightsProps {
  data: TaskInsightsType;
  className?: string;
  onTaskClick?: (taskId: string) => void;
}

export const TaskInsights = memo(function TaskInsights(props: TaskInsightsProps) {
  return renderTaskInsights(props);
});

