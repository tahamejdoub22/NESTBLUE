"use client";

import { motion } from "framer-motion";
import { PerformanceMetrics as PerformanceMetricsType } from "@/interfaces/dashboard.interface";
import { StatCard } from "@/components/molecules/stat-card";
import { CheckCircle2, Clock, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/motion";

export interface PerformanceMetricsProps {
  data: PerformanceMetricsType;
  className?: string;
}

export function PerformanceMetrics(props: PerformanceMetricsProps) {
  const { data, className } = props;

  const getCompletionRateTrend = (rate: number) => {
    if (rate >= 80) return { value: 5, trend: "up" as const };
    if (rate >= 60) return { value: 2, trend: "stable" as const };
    return { value: -3, trend: "down" as const };
  };

  const getOnTimeTrend = (rate: number) => {
    if (rate >= 90) return { value: 8, trend: "up" as const };
    if (rate >= 70) return { value: 3, trend: "up" as const };
    return { value: -5, trend: "down" as const };
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={cn("", className)}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={staggerItem}>
          <StatCard
            title="Completion Rate"
            value={`${data.completionRate.toFixed(1)}%`}
            icon={CheckCircle2}
            change={getCompletionRateTrend(data.completionRate)}
            description={
              data.completionRate >= 80
                ? "Excellent progress"
                : data.completionRate >= 60
                  ? "Good progress"
                  : "Needs improvement"
            }
            variant="default"
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            title="Avg Completion Time"
            value={`${data.avgCompletionTime.toFixed(1)} days`}
            icon={Clock}
            description="Average task completion"
            variant="default"
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            title="On-Time Delivery"
            value={`${data.onTimeRate.toFixed(1)}%`}
            icon={Target}
            change={getOnTimeTrend(data.onTimeRate)}
            description={
              data.onTimeRate >= 90
                ? "Excellent timing"
                : data.onTimeRate >= 70
                  ? "Good timing"
                  : "Needs attention"
            }
            variant="default"
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            title="Sprint Velocity"
            value={data.sprintVelocity.toFixed(1)}
            icon={Zap}
            description="Tasks per sprint"
            variant="gradient"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}


