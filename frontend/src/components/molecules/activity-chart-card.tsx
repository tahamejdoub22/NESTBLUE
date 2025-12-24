"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, chartBar, transitions } from "@/lib/motion";

export interface ActivityDataPoint {
  day: string;
  allTasks: number;
  myTasks: number;
  percentage: number;
}

export interface ActivityChartCardProps {
  title?: string;
  data: ActivityDataPoint[];
  period?: string;
  onPeriodChange?: (period: string) => void;
  className?: string;
  delay?: number;
}

export function ActivityChartCard({
  title = "Track your activity",
  data,
  period = "This week",
  onPeriodChange,
  className,
  delay = 0,
}: ActivityChartCardProps) {
  const maxValue = Math.max(...data.map((d) => d.allTasks));

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={{ ...transitions.default, delay }}
      className={cn("h-full", className)}
    >
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <Select value={period} onValueChange={onPeriodChange}>
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue />
              <ChevronDown className="h-4 w-4 ml-2" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="This week">This week</SelectItem>
              <SelectItem value="This month">This month</SelectItem>
              <SelectItem value="This year">This year</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{data.reduce((sum, d) => sum + d.allTasks, 0)} All of tasks</span>
              <span className="text-muted-foreground flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                {data.reduce((sum, d) => sum + d.myTasks, 0)} My task
              </span>
            </div>

            <div className="relative h-[200px] flex items-end justify-between gap-2">
              {data.map((point, index) => {
                const allTasksHeight = (point.allTasks / maxValue) * 100;
                const myTasksHeight = (point.myTasks / maxValue) * 100;

                return (
                  <div key={point.day} className="flex-1 flex flex-col items-center gap-1">
                    <div className="relative w-full h-full flex items-end justify-center">
                      <div className="absolute bottom-0 w-full flex flex-col items-center gap-0.5">
                        {/* All tasks bar (lighter, semi-transparent) */}
                        <motion.div
                          custom={allTasksHeight}
                          variants={chartBar}
                          initial="hidden"
                          animate="visible"
                          className="w-full bg-primary/30 rounded-t"
                          style={{ height: `${allTasksHeight}%` }}
                        />
                        {/* My tasks bar (solid) */}
                        <motion.div
                          custom={myTasksHeight}
                          variants={chartBar}
                          initial="hidden"
                          animate="visible"
                          transition={{ delay: index * 0.05 }}
                          className="w-full bg-primary rounded-t"
                          style={{ height: `${myTasksHeight}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground mt-2">{point.day}</span>
                  </div>
                );
              })}
            </div>

            {/* Trend line with percentage */}
            <div className="flex items-center justify-center pt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-px w-8 border-t border-dashed border-primary" />
                <span className="font-semibold text-primary">
                  {data[Math.floor(data.length / 2)]?.percentage.toFixed(1)}%
                </span>
                <div className="h-px w-8 border-t border-dashed border-primary" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


