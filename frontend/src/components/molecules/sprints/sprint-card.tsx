"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { Progress } from "@/components/atoms/progress";
import { Button } from "@/components/atoms/button";
import { Text } from "@/components/atoms/text";
import { cn } from "@/lib/utils";
import type { Sprint } from "@/interfaces";
import {
  Calendar,
  Target,
  Edit,
  Trash2,
  ArrowRight,
  CheckCircle2,
  Clock,
  PlayCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useProjects } from "@/hooks/use-projects";

interface SprintCardProps {
  sprint: Sprint;
  onEdit?: (sprint: Sprint) => void;
  onDelete?: (sprint: Sprint) => void;
  isDeleting?: boolean;
}

const STATUS_CONFIG = {
  planned: {
    label: "Planned",
    color: "bg-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    textColor: "text-blue-700 dark:text-blue-300",
    borderColor: "border-blue-200 dark:border-blue-800",
    icon: Clock,
  },
  active: {
    label: "Active",
    color: "bg-green-500",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    textColor: "text-green-700 dark:text-green-300",
    borderColor: "border-green-200 dark:border-green-800",
    icon: PlayCircle,
  },
  completed: {
    label: "Completed",
    color: "bg-gray-500",
    bgColor: "bg-gray-50 dark:bg-gray-950/30",
    textColor: "text-gray-700 dark:text-gray-300",
    borderColor: "border-gray-200 dark:border-gray-800",
    icon: CheckCircle2,
  },
};

export function SprintCard({ sprint, onEdit, onDelete, isDeleting }: SprintCardProps) {
  const router = useRouter();
  const { projects } = useProjects();
  const project = projects.find((p) => p.uid === sprint.projectId);
  
  const statusConfig = STATUS_CONFIG[sprint.status];
  const StatusIcon = statusConfig.icon;
  
  const progress = sprint.taskCount > 0 
    ? Math.round((sprint.completedTaskCount / sprint.taskCount) * 100)
    : 0;
  
  const daysRemaining = sprint.endDate
    ? Math.ceil((new Date(sprint.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;
  
  const isOverdue = daysRemaining < 0 && sprint.status !== "completed";
  const isDueSoon = daysRemaining >= 0 && daysRemaining <= 3 && sprint.status === "active";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          "group relative overflow-hidden transition-all duration-200",
          "hover:shadow-lg hover:border-primary/20 hover:-translate-y-1",
          isDeleting && "opacity-50 pointer-events-none"
        )}
      >
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-base text-foreground truncate">
                  {sprint.name}
                </h3>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-medium",
                    statusConfig.bgColor,
                    statusConfig.textColor,
                    statusConfig.borderColor
                  )}
                >
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig.label}
                </Badge>
              </div>
              {project && (
                <Text variant="small" className="text-muted-foreground">
                  {project.name}
                </Text>
              )}
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-muted"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(sprint);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(sprint);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Goal */}
          {sprint.goal && (
            <div className="mb-4">
              <div className="flex items-start gap-2">
                <Target className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <Text variant="small" className="text-muted-foreground line-clamp-2">
                  {sprint.goal}
                </Text>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="flex items-center gap-4 mb-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {sprint.startDate && format(new Date(sprint.startDate), "MMM d")} -{" "}
                {sprint.endDate && format(new Date(sprint.endDate), "MMM d, yyyy")}
              </span>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <Text variant="small" className="text-muted-foreground">
                Progress
              </Text>
              <Text variant="small" className="font-medium">
                {sprint.completedTaskCount} / {sprint.taskCount} tasks
              </Text>
            </div>
            <Progress value={progress} className="h-2" />
            <Text variant="small" className="text-muted-foreground text-center">
              {progress}% complete
            </Text>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              {isOverdue && (
                <Badge variant="destructive" className="text-xs">
                  Overdue
                </Badge>
              )}
              {isDueSoon && !isOverdue && (
                <Badge variant="outline" className="text-xs border-warning text-warning">
                  Due soon
                </Badge>
              )}
              {daysRemaining > 3 && sprint.status === "active" && (
                <Text variant="small" className="text-muted-foreground">
                  {daysRemaining} days left
                </Text>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/sprints/${sprint.id || sprint.uid}`)}
              className="h-8 gap-1.5"
            >
              View Details
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

