"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ProjectStatistics as ProjectStatisticsType, DashboardData } from "@/interfaces/dashboard.interface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Progress } from "@/components/atoms/progress";
import { ProjectOverviewChart, type ProjectOverviewDataPoint } from "@/components/molecules/project-overview-chart";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CheckCircle2, Clock, ListTodo, TrendingUp } from "lucide-react";
import { fadeInUp, transitions } from "@/lib/motion";

export interface ProjectStatisticsTemplateProps {
  data: ProjectStatisticsType;
  dashboardData?: DashboardData;
  className?: string;
}

export function renderProjectStatistics(props: ProjectStatisticsTemplateProps) {
  const { data, dashboardData, className } = props;

  // Project Overview will fetch its own data from backend
  // No need to generate data here - let the component handle it

  return (
    <div className={cn("grid grid-cols-1 gap-2", className)}>
      {/* Project Overview Chart - fetches data from backend */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={transitions.default}
        className="h-full"
      >
        <ProjectOverviewChart />
      </motion.div>

      {/* Progress Overview - Enhanced Design */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ ...transitions.default, delay: 0.1 }}
      >
        <Card className="relative overflow-hidden border border-border/40 bg-card hover:shadow-md transition-all duration-200">
          <CardHeader className="relative z-10 pb-3 px-4 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                Progress
              </CardTitle>
              <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>{Math.round(data.progressPercentage)}%</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10 pt-0 px-4 pb-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completion</span>
                <span className="font-semibold text-foreground">
                  {Math.round(data.progressPercentage)}%
                </span>
              </div>
              <div className="relative">
                <Progress 
                  value={Math.max(0, Math.min(100, data.progressPercentage))} 
                  className="h-2 bg-muted/50" 
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(0, Math.min(100, data.progressPercentage))}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                  className="absolute top-0 left-0 h-full bg-primary rounded-full"
                />
              </div>
            </div>

            {/* Task Statistics Grid */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/40">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center p-3 rounded-lg bg-muted/30 border border-border/40"
              >
                <p className="text-xl font-bold">{data.totalTasks}</p>
                <p className="text-xs font-medium text-muted-foreground mt-1">Total</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30"
              >
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {data.completedTasks}
                </p>
                <p className="text-xs font-medium text-muted-foreground mt-1">Done</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20"
              >
                <p className="text-xl font-bold text-primary">
                  {data.inProgressTasks}
                </p>
                <p className="text-xs font-medium text-muted-foreground mt-1">Active</p>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
