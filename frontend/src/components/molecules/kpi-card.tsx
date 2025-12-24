"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/atoms/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { fadeInUp, transitions } from "@/lib/motion";

export interface KPICardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: "up" | "down";
  };
  className?: string;
  delay?: number;
}

export function KPICard({ title, value, change, className, delay = 0 }: KPICardProps) {
  const isPositive = change?.trend === "up";
  const changeColor = isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400";

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={{ ...transitions.default, delay }}
    >
      <Card className={cn("bg-card border-border", className)}>
        <CardContent className="p-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-foreground">
                {typeof value === "number" ? value.toLocaleString() : value}
              </p>
              {change && (
                <div className={cn("flex items-center gap-0.5 text-xs font-semibold", changeColor)}>
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{Math.abs(change.value)}%</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


