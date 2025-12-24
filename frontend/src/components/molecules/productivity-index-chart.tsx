"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { cn } from "@/lib/utils";
import { fadeInUp, transitions } from "@/lib/motion";
import { TrendingUp } from "lucide-react";

export interface ProductivityIndexChartProps {
  productivityIndex: number;
  overdueTasks: number;
  dueThisWeek: number;
  recentlyCompleted: number;
  totalTasks: number;
  className?: string;
}


export const ProductivityIndexChart = memo(function ProductivityIndexChart({
  productivityIndex,
  overdueTasks,
  dueThisWeek,
  recentlyCompleted,
  totalTasks,
  className,
}: ProductivityIndexChartProps) {
  // Calculate percentages
  const overduePercentage = totalTasks > 0 ? (overdueTasks / totalTasks) * 100 : 0;
  const dueThisWeekPercentage = totalTasks > 0 ? (dueThisWeek / totalTasks) * 100 : 0;
  const completedPercentage = totalTasks > 0 ? (recentlyCompleted / totalTasks) * 100 : 0;

  // Prepare data for pie chart with semantic colors
  const pieData = useMemo(() => {
    const data = [
      {
        name: "Overdue Tasks",
        value: overdueTasks,
        percentage: overduePercentage.toFixed(0),
        color: "hsl(var(--destructive))", // Red for overdue
      },
      {
        name: "Due This Week",
        value: dueThisWeek,
        percentage: dueThisWeekPercentage.toFixed(0),
        color: "hsl(var(--warning))", // Amber for upcoming
      },
      {
        name: "Recently Completed",
        value: recentlyCompleted,
        percentage: completedPercentage.toFixed(0),
        color: "hsl(var(--success))", // Green for completed
      },
    ].filter((item) => item.value > 0); // Only show non-zero values

    return data;
  }, [overdueTasks, dueThisWeek, recentlyCompleted, overduePercentage, dueThisWeekPercentage, completedPercentage]);

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="h-full"
    >
      <Card className={cn("relative overflow-hidden border border-border/40 bg-card hover:shadow-lg transition-all duration-300 h-full", className)}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              Productivity Index
            </CardTitle>
            <div className="px-3 py-1 rounded-full bg-primary/10 text-primary font-black text-xl tracking-tighter">
              {Math.round(productivityIndex)}%
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {pieData.length > 0 && (
            <div className="w-full space-y-5">
              {pieData.map((entry, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-2 w-2 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm font-semibold text-foreground/80">{entry.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{entry.value}</span>
                      <span className="text-xs font-medium text-muted-foreground">({entry.percentage}%)</span>
                    </div>
                  </div>
                  <div className="relative w-full h-2.5 bg-muted rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Number(entry.percentage)}%` }}
                      transition={{ duration: 1, delay: 0.3 + index * 0.1, ease: "easeOut" }}
                      className="h-full rounded-full shadow-sm"
                      style={{ backgroundColor: entry.color }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});


