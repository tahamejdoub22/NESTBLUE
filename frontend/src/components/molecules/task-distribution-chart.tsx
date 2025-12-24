"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { TaskDistribution } from "@/interfaces/dashboard.interface";
import { cn } from "@/lib/utils";
import { TaskStatus } from "@/interfaces/task.interface";

export interface TaskDistributionChartProps {
  data: TaskDistribution;
  className?: string;
  variant?: "pie" | "bar";
}

const statusColors: Record<TaskStatus, string> = {
  todo: "bg-primary/30",
  "in-progress": "bg-primary/60",
  complete: "bg-primary",
  backlog: "bg-primary/20",
};

const statusLabels: Record<TaskStatus, string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  complete: "Complete",
  backlog: "Backlog",
};

export function TaskDistributionChart({
  data,
  className,
  variant = "bar",
}: TaskDistributionChartProps) {
  const total = Object.values(data).reduce((sum, count) => sum + count, 0);
  const entries = (Object.entries(data) as [TaskStatus, number][]).filter(
    ([, count]) => count > 0
  );

  if (total === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Task Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            No tasks available
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "pie") {
    let currentAngle = 0;
    const segments = entries.map(([status, count]) => {
      const percentage = (count / total) * 100;
      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;

      const startAngleRad = (startAngle * Math.PI) / 180;
      const endAngleRad = (currentAngle * Math.PI) / 180;
      const largeArcFlag = angle > 180 ? 1 : 0;

      const x1 = 50 + 40 * Math.cos(startAngleRad);
      const y1 = 50 + 40 * Math.sin(startAngleRad);
      const x2 = 50 + 40 * Math.cos(endAngleRad);
      const y2 = 50 + 40 * Math.sin(endAngleRad);

      return {
        status,
        count,
        percentage,
        path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`,
      };
    });

    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Task Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-32 h-32">
                {segments.map((segment, index) => (
                  <path
                    key={segment.status}
                    d={segment.path}
                    fill="currentColor"
                    className={cn(statusColors[segment.status], "text-opacity-80")}
                  />
                ))}
              </svg>
            </div>
            <div className="flex-1 space-y-2">
              {entries.map(([status, count]) => {
                const percentage = (count / total) * 100;
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn("w-3 h-3 rounded-full", statusColors[status])}
                      />
                      <span className="text-sm text-muted-foreground">
                        {statusLabels[status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{count}</span>
                      <span className="text-xs text-muted-foreground">
                        ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Bar chart variant
  const maxValue = Math.max(...entries.map(([, count]) => count));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Task Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {entries.map(([status, count]) => {
            const percentage = (count / total) * 100;
            const barWidth = (count / maxValue) * 100;

            return (
              <div key={status} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn("w-2.5 h-2.5 rounded-full", statusColors[status])}
                    />
                    <span className="font-medium">{statusLabels[status]}</span>
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
                      statusColors[status]
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

