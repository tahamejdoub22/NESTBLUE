"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Avatar } from "@/components/atoms/avatar";
import { Badge } from "@/components/atoms/badge";
import { UserActivity } from "@/interfaces/dashboard.interface";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2,
  Plus,
  Edit,
  MessageSquare,
  FolderPlus,
  MoreHorizontal,
} from "lucide-react";

export interface ActivityFeedProps {
  activities: UserActivity[];
  className?: string;
  maxItems?: number;
}

const activityIcons = {
  task_created: Plus,
  task_completed: CheckCircle2,
  task_updated: Edit,
  comment_added: MessageSquare,
  project_created: FolderPlus,
};

const activityColors = {
  task_created: "bg-primary/10 text-primary",
  task_completed: "bg-primary/10 text-primary",
  task_updated: "bg-primary/10 text-primary",
  comment_added: "bg-primary/10 text-primary",
  project_created: "bg-primary/10 text-primary",
};

export function ActivityFeed({
  activities,
  className,
  maxItems = 10,
}: ActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems);

  if (displayActivities.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            No recent activity
          </div>
        </CardContent>
      </Card>
    );
  }

  // Count activities by type
  const activityStats = displayActivities.reduce((acc, activity) => {
    acc[activity.type] = (acc[activity.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalActivities = displayActivities.length;

  return (
    <Card className={cn("relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group", className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="relative z-10 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            Recent Activity
          </CardTitle>
          <span className="text-xs font-semibold text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
            {totalActivities} items
          </span>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        {displayActivities.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
            No recent activity
          </div>
        ) : (
          <div className="space-y-4">
            {/* Activity Statistics */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {Object.entries(activityStats).slice(0, 4).map(([type, count]) => {
                const Icon = activityIcons[type as keyof typeof activityIcons] || CheckCircle2;
                const percentage = (count / totalActivities) * 100;
                return (
                  <div key={type} className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1 rounded bg-primary/10 text-primary">
                        <Icon className="h-3 w-3" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground uppercase">
                        {type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-foreground">{count}</span>
                      <span className="text-xs text-muted-foreground">({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Compact Activity List */}
            <div className="space-y-2 border-t border-border/50 pt-4">
              {displayActivities.slice(0, 3).map((activity) => {
                const Icon = activityIcons[activity.type];
                return (
                  <div
                    key={activity.id}
                    className="flex items-center gap-2 text-sm group hover:bg-muted/30 rounded-lg p-2 -m-2 transition-colors"
                  >
                    <div className="p-1 rounded bg-primary/10 text-primary">
                      <Icon className="h-3 w-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">
                        {activity.userName} {activity.description}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(activity.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                );
              })}
              {displayActivities.length > 3 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  +{displayActivities.length - 3} more activities
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

