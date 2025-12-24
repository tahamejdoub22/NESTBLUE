"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { PriorityAnalysis } from "@/interfaces/dashboard.interface";
import { cn } from "@/lib/utils";
import { TaskPriority } from "@/interfaces/task.interface";

export interface PriorityChartProps {
  data: PriorityAnalysis;
  className?: string;
}

const priorityColors: Record<TaskPriority, string> = {
  low: "bg-primary/20",
  medium: "bg-primary/50",
  high: "bg-primary/80",
  urgent: "bg-primary",
};

const priorityLabels: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export function PriorityChart({ data, className }: PriorityChartProps) {
  const total = Object.values(data).reduce((sum, count) => sum + count, 0);
  const entries = (Object.entries(data) as [TaskPriority, number][]).filter(
    ([, count]) => count > 0
  );

  if (total === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Priority Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            No tasks available
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...entries.map(([, count]) => count));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Priority Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {entries.map(([priority, count]) => {
            const percentage = (count / total) * 100;
            const barWidth = (count / maxValue) * 100;

            return (
              <div key={priority} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn("w-2.5 h-2.5 rounded-full", priorityColors[priority])}
                    />
                    <span className="font-medium">{priorityLabels[priority]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{count}</span>
                    <span className="text-muted-foreground">
                      ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      priorityColors[priority]
                    )}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

