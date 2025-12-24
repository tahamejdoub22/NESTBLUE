"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/atoms/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { fadeInUp } from "@/lib/motion";

interface HealthScoreCardProps {
  score: number;
  trend: "up" | "down" | "stable";
  className?: string;
}

export function HealthScoreCard({ score, trend, className }: HealthScoreCardProps) {
  const roundedScore = Math.round(score);
  const circumference = 2 * Math.PI * 38; // radius = 38 for better proportions
  const offset = circumference - (roundedScore / 100) * circumference;

  const getStatusText = () => {
    if (roundedScore >= 80) return "Excellent";
    if (roundedScore >= 60) return "Good";
    if (roundedScore >= 40) return "Fair";
    return "Needs Attention";
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className={cn("h-full", className)}
    >
      <Card className="group relative overflow-hidden h-full border-0 bg-primary text-primary-foreground hover:shadow-xl transition-all duration-500">
        <CardContent className="p-5 relative z-10 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/10">
                <Activity className="h-4 w-4 text-primary-foreground" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/80">
                Health Score
              </p>
            </div>
            {trend && (
              <div className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold text-primary-foreground flex items-center gap-1">
                {trend === "up" ? (
                  <TrendingUp className="h-3 w-3" />
                ) : trend === "down" ? (
                  <TrendingDown className="h-3 w-3" />
                ) : null}
                {trend === "up" ? "+5%" : trend === "down" ? "-3%" : "0%"}
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex items-center gap-6 flex-1">
            {/* Circular Progress Indicator */}
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg className="transform -rotate-90 w-24 h-24">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-white/10"
                />
                <motion.circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 - (roundedScore / 100) * (2 * Math.PI * 40)}
                  strokeLinecap="round"
                  className="text-white"
                  initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 40 - (roundedScore / 100) * (2 * Math.PI * 40) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {roundedScore}%
                </span>
              </div>
            </div>

            {/* Status Info */}
            <div className="flex-1 space-y-3 min-w-0">
              <div className="space-y-1">
                <p className="text-lg font-bold text-white leading-none">
                  {getStatusText()}
                </p>
                <p className="text-xs text-white/70 font-medium">
                  {roundedScore >= 80
                    ? "Optimal workspace performance"
                    : roundedScore >= 60
                      ? "Stable performance levels"
                      : "Action recommended"}
                </p>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, roundedScore)}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                  className="h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                />
              </div>
            </div>
          </div>

          {/* Decorative background element */}
          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/5 blur-3xl group-hover:bg-white/10 transition-colors duration-500" />
        </CardContent>
      </Card>
    </motion.div>
  );
}

