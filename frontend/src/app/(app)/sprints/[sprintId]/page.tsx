"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { SprintBoard } from "@/components/organisms/sprint-board";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import { Progress } from "@/components/atoms/progress";
import { Text } from "@/components/atoms/text";
import { useSprint, useSprintTasks } from "@/hooks/use-sprints";
import { useProject } from "@/hooks/use-projects";
import { LoadingScreen } from "@/components/atoms/loading-screen";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  Target,
  CheckCircle2,
  Clock,
  PlayCircle,
  Edit,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { SprintFormModal } from "@/components/molecules/sprints/sprint-form-modal";
import type { Sprint } from "@/interfaces";

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

export default function SprintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sprintId = params.sprintId as string;
  
  const { sprint, isLoading: sprintLoading, updateSprint, isUpdating } = useSprint(sprintId);
  const { tasks, isLoading: tasksLoading } = useSprintTasks(sprintId);
  const { project } = useProject(sprint?.projectId || "");
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const progress = sprint && sprint.taskCount > 0
    ? Math.round((sprint.completedTaskCount / sprint.taskCount) * 100)
    : 0;

  const daysRemaining = sprint?.endDate
    ? Math.ceil((new Date(sprint.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  const isOverdue = daysRemaining < 0 && sprint?.status !== "completed";
  const isDueSoon = daysRemaining >= 0 && daysRemaining <= 3 && sprint?.status === "active";

  const statusConfig = sprint ? STATUS_CONFIG[sprint.status] : STATUS_CONFIG.planned;
  const StatusIcon = statusConfig.icon;

  const handleUpdateSprint = async (data: Partial<Sprint>) => {
    try {
      await updateSprint(data);
      setIsEditModalOpen(false);
      toast.success("Sprint updated successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to update sprint");
    }
  };

  if (sprintLoading || tasksLoading) {
    return <LoadingScreen />;
  }

  if (!sprint) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Text variant="h2" className="mb-4">Sprint not found</Text>
        <Button onClick={() => router.push("/sprints")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sprints
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
        {/* Enhanced Header with Background */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20 p-6 md:p-8 lg:p-10 shadow-sm hover:shadow-md transition-shadow duration-300"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.1),transparent_50%)]" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
            <div className="flex items-start gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/sprints")}
                className="h-10 w-10 hover:bg-background/80"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <Text variant="h1" className="font-bold text-2xl md:text-3xl mb-1">
                      {sprint.name}
                    </Text>
                    {project && (
                      <div className="flex items-center gap-2">
                        <Text variant="caption" className="text-muted-foreground">
                          {project.name}
                        </Text>
                        <span className="text-muted-foreground">•</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/projects/${sprint.projectId}`)}
                          className="h-6 px-2 text-xs hover:bg-background/80"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Project
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-sm font-medium px-3 py-1",
                      statusConfig.bgColor,
                      statusConfig.textColor,
                      statusConfig.borderColor
                    )}
                  >
                    <StatusIcon className="h-3 w-3 mr-1.5" />
                    {statusConfig.label}
                  </Badge>
                  {sprint.goal && (
                    <Badge variant="outline" className="text-xs">
                      <Target className="h-3 w-3 mr-1.5" />
                      Goal Set
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(true)}
                className="gap-2 bg-background/80 backdrop-blur-sm"
              >
                <Edit className="h-4 w-4" />
                Edit Sprint
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Sprint Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
        >
          <Card className="border-2 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] bg-card/50 backdrop-blur-sm">
            <CardContent className="p-5 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <Text variant="body-sm" className="text-muted-foreground font-medium">
                  Progress
                </Text>
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                  <Target className="h-5 w-5 text-primary" />
                </div>
              </div>
              <Text variant="h2" className="font-bold mb-3 text-2xl">
                {progress}%
              </Text>
              <Progress value={progress} className="h-3 mb-3 rounded-full" />
              <Text variant="caption" className="text-muted-foreground">
                {sprint.completedTaskCount} / {sprint.taskCount} tasks completed
              </Text>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] bg-card/50 backdrop-blur-sm">
            <CardContent className="p-5 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <Text variant="body-sm" className="text-muted-foreground font-medium">
                  Duration
                </Text>
                <div className="h-11 w-11 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-sm">
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <Text variant="h2" className="font-bold mb-2 text-2xl">
                {sprint.startDate && sprint.endDate
                  ? Math.ceil(
                      (new Date(sprint.endDate).getTime() -
                        new Date(sprint.startDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  : 0}
              </Text>
              <Text variant="caption" className="text-muted-foreground mb-2 font-medium">
                days
              </Text>
              {sprint.startDate && sprint.endDate && (
                <Text variant="caption" className="text-muted-foreground">
                  {format(new Date(sprint.startDate), "MMM d")} -{" "}
                  {format(new Date(sprint.endDate), "MMM d, yyyy")}
                </Text>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] bg-card/50 backdrop-blur-sm">
            <CardContent className="p-5 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <Text variant="body-sm" className="text-muted-foreground font-medium">
                  Total Tasks
                </Text>
                <div className="h-11 w-11 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-sm">
                  <CheckCircle2 className="h-5 w-5 text-purple-500" />
                </div>
              </div>
              <Text variant="h2" className="font-bold mb-2 text-2xl">
                {sprint.taskCount}
              </Text>
              <Text variant="caption" className="text-muted-foreground">
                {sprint.completedTaskCount} completed
              </Text>
            </CardContent>
          </Card>

          <Card className={cn(
            "border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] bg-card/50 backdrop-blur-sm",
            isOverdue ? "hover:border-destructive/30 border-destructive/20" :
            isDueSoon ? "hover:border-amber-500/30 border-amber-500/20" :
            "hover:border-green-500/30"
          )}>
            <CardContent className="p-5 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <Text variant="body-sm" className="text-muted-foreground font-medium">
                  Time Remaining
                </Text>
                <div className={cn(
                  "h-11 w-11 rounded-xl flex items-center justify-center border shadow-sm",
                  isOverdue ? "bg-destructive/10 border-destructive/20" :
                  isDueSoon ? "bg-amber-500/10 border-amber-500/20" :
                  "bg-green-500/10 border-green-500/20"
                )}>
                  <Clock className={cn(
                    "h-5 w-5",
                    isOverdue ? "text-destructive" :
                    isDueSoon ? "text-amber-500" :
                    "text-green-500"
                  )} />
                </div>
              </div>
              <Text variant="h2" className={cn(
                "font-bold mb-2 text-2xl",
                isOverdue && "text-destructive",
                isDueSoon && "text-amber-600 dark:text-amber-400"
              )}>
                {isOverdue ? (
                  "Overdue"
                ) : isDueSoon ? (
                  "Due Soon"
                ) : daysRemaining > 0 ? (
                  `${daysRemaining}`
                ) : (
                  "Done"
                )}
              </Text>
              {sprint.endDate && (
                <Text variant="caption" className="text-muted-foreground">
                  {daysRemaining > 0 ? "days left" : "Completed"}
                  {daysRemaining > 0 && ` • Ends ${format(new Date(sprint.endDate), "MMM d")}`}
                </Text>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Goal Section */}
        {sprint.goal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-2"
          >
            <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 via-primary/5 to-transparent shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-4 px-6 pt-6">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  Sprint Goal
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <Text variant="body" className="text-foreground/90 leading-relaxed text-base">
                  {sprint.goal}
                </Text>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Sprint Board Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between mb-4 px-1">
            <div>
              <Text variant="h3" className="font-semibold mb-2 text-xl md:text-2xl">
                Sprint Tasks
              </Text>
              <Text variant="body-sm" className="text-muted-foreground">
                Manage and track all tasks in this sprint ({tasks?.length || 0} tasks)
              </Text>
            </div>
          </div>
          <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4 md:p-6">
              <SprintBoard
                projectName={project?.name || "Project"}
                projectId={sprint.projectId}
                sprintId={sprintId}
                initialTasks={tasks || []}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Edit Modal */}
      <SprintFormModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSubmit={handleUpdateSprint}
        sprint={sprint}
        isLoading={isUpdating}
      />
    </div>
  );
}

