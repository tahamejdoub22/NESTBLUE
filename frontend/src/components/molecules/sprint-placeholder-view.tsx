// src/components/molecules/sprint-placeholder-view.tsx
"use client";

import { Card } from "@/components/atoms/card";
import { Text } from "@/components/atoms/text";
import { Calendar, GanttChart } from "lucide-react";

interface SprintPlaceholderViewProps {
  type: "calendar" | "gantt";
}

export function SprintPlaceholderView({ type }: SprintPlaceholderViewProps) {
  const icon = type === "calendar" ? <Calendar className="mx-auto h-12 w-12 text-gray-400" /> 
    : <GanttChart className="mx-auto h-12 w-12 text-gray-400" />;
  
  const title = type === "calendar" ? "Calendar View" : "Gantt View";
  const description = type === "calendar" ? "Calendar view coming soon" : "Gantt chart view coming soon";

  return (
    <Card className="p-8 text-center">
      {icon}
      <Text variant="h4" className="mt-4">{title}</Text>
      <Text variant="muted" className="mt-2">{description}</Text>
    </Card>
  );
}