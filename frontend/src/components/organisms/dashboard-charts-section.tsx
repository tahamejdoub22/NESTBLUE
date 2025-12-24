"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ProductivityIndexChart } from "@/components/molecules/productivity-index-chart";
import { BurnDownChart } from "@/components/molecules/burn-down-chart";
import { useDashboard } from "@/hooks/use-dashboard";
import { fadeInUp, transitions } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface DashboardChartsSectionProps {
  className?: string;
}

export function DashboardChartsSection({ className }: DashboardChartsSectionProps) {
  const { data: dashboardData } = useDashboard();

  if (!dashboardData) {
    return null;
  }

  return (
    <div className={cn("space-y-2", className)}>
        {/* Productivity Index Chart with Overdue Tasks Pie */}
        {dashboardData.taskInsights && (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ ...transitions.default, delay: 0.1 }}
          >
            <ProductivityIndexChart
              productivityIndex={dashboardData.taskInsights.productivityIndex}
              overdueTasks={dashboardData.taskInsights.overdueTasks.length}
              dueThisWeek={dashboardData.taskInsights.tasksDueThisWeek.length}
              recentlyCompleted={dashboardData.taskInsights.recentlyCompleted.length}
              totalTasks={
                dashboardData.taskInsights.overdueTasks.length +
                dashboardData.taskInsights.tasksDueThisWeek.length +
                dashboardData.taskInsights.recentlyCompleted.length
              }
            />
          </motion.div>
        )}

        {/* Burn-down Chart */}
        {dashboardData.projectStatistics.burnDownData.length > 0 && (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ ...transitions.default, delay: 0.2 }}
          >
            <BurnDownChart data={dashboardData.projectStatistics.burnDownData} />
          </motion.div>
        )}
    </div>
  );
}


