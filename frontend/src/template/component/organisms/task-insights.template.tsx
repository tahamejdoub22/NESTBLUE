"use client";

import { motion } from "framer-motion";
import { TaskInsights as TaskInsightsType } from "@/interfaces/dashboard.interface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Progress } from "@/components/atoms/progress";
import { cn } from "@/lib/utils";
import { AlertCircle, Calendar, CheckCircle2, TrendingUp, ArrowUpRight, Clock, ListTodo } from "lucide-react";
import { fadeInUp, transitions } from "@/lib/motion";
import { Button } from "@/components/atoms/button";

export interface TaskInsightsTemplateProps {
  data: TaskInsightsType;
  className?: string;
  onTaskClick?: (taskId: string) => void;
}

export function renderTaskInsights(props: TaskInsightsTemplateProps) {
  const {
    data,
    className,
    onTaskClick,
  } = props;

  const totalTasks = data.overdueTasks.length + data.tasksDueThisWeek.length + data.recentlyCompleted.length;
  
  const categories = [
    {
      label: "Overdue",
      count: data.overdueTasks.length,
      icon: AlertCircle,
      color: "destructive",
      bgColor: "bg-destructive/10",
      textColor: "text-destructive",
      borderColor: "border-destructive/20",
      tasks: data.overdueTasks
    },
    {
      label: "Due This Week",
      count: data.tasksDueThisWeek.length,
      icon: Calendar,
      color: "warning",
      bgColor: "bg-warning/10",
      textColor: "text-warning-600 dark:text-warning-400",
      borderColor: "border-warning/20",
      tasks: data.tasksDueThisWeek
    },
    {
      label: "Completed",
      count: data.recentlyCompleted.length,
      icon: CheckCircle2,
      color: "success",
      bgColor: "bg-success/10",
      textColor: "text-success",
      borderColor: "border-success/20",
      tasks: data.recentlyCompleted
    }
  ];

  return (
    <Card className="h-full border border-border/40 bg-card hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <ListTodo className="h-5 w-5 text-primary" />
          </div>
          Task Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map((cat, index) => (
          <motion.div
            key={cat.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "group relative overflow-hidden rounded-xl border p-4 transition-all duration-200 hover:shadow-md",
              cat.borderColor,
              "hover:border-transparent hover:bg-muted/30"
            )}
          >
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className={cn("p-2.5 rounded-xl", cat.bgColor, cat.textColor)}>
                  <cat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground/90">{cat.label}</p>
                  <p className="text-xs text-muted-foreground font-medium">
                    {totalTasks > 0 ? ((cat.count / totalTasks) * 100).toFixed(0) : 0}% of tracking tasks
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn("text-2xl font-black tracking-tighter", cat.textColor)}>
                  {cat.count}
                </span>
                {cat.count > 0 && onTaskClick && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onTaskClick(cat.tasks[0].id)}
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            {/* Subtle progress background */}
            <div 
              className={cn("absolute inset-y-0 left-0 opacity-5 transition-all duration-500", cat.bgColor)}
              style={{ width: `${totalTasks > 0 ? (cat.count / totalTasks) * 100 : 0}%` }}
            />
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}



