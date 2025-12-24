"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { WorkspaceOverview as WorkspaceOverviewType } from "@/interfaces/dashboard.interface";
import { StatCard } from "@/components/molecules/stat-card";
import { HealthScoreCard } from "@/components/molecules/health-score-card";
import { FolderKanban, Users, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/motion";

export interface WorkspaceOverviewProps {
  data: WorkspaceOverviewType;
  className?: string;
}

export const WorkspaceOverview = memo(function WorkspaceOverview(props: WorkspaceOverviewProps) {
  const { data, className } = props;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={cn("", className)}
    >
      {/* TOP KPI ROW - Enterprise Layout */}
      <div className="grid grid-cols-12 gap-4 lg:gap-6">
        <motion.div variants={staggerItem} className="col-span-12 sm:col-span-6 lg:col-span-3">
          <StatCard
            title="Total Projects"
            value={data.totalProjects}
            icon={FolderKanban}
            change={
              data.totalProjects > 0
                ? { value: 12, trend: "up" }
                : undefined
            }
          />
        </motion.div>
        <motion.div variants={staggerItem} className="col-span-12 sm:col-span-6 lg:col-span-3">
          <StatCard
            title="Active Sprints"
            value={data.activeSprints}
            icon={Target}
            description={data.activeSprints > 0 ? "Currently running" : "No active sprints"}
          />
        </motion.div>
        <motion.div variants={staggerItem} className="col-span-12 sm:col-span-6 lg:col-span-3">
          <StatCard
            title="Team Members"
            value={data.teamMembers}
            icon={Users}
            change={{ value: 5, trend: "up" }}
          />
        </motion.div>
        <motion.div variants={staggerItem} className="col-span-12 sm:col-span-6 lg:col-span-3">
          <HealthScoreCard
            score={data.healthScore}
            trend={data.healthTrend}
          />
        </motion.div>
      </div>
    </motion.div>
  );
});
