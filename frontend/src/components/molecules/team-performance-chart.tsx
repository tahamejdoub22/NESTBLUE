"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { cn } from "@/lib/utils";
import { fadeInUp, transitions } from "@/lib/motion";
import { Users, Award } from "lucide-react";

export interface TeamMemberPerformance {
  name: string;
  tasksCompleted: number;
  tasksCreated: number;
  commentsAdded: number;
  productivity: number;
}

export interface TeamPerformanceChartProps {
  data: TeamMemberPerformance[];
  className?: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3 z-50">
        <p className="text-xs font-semibold text-foreground mb-2">
          {payload[0].payload.name}
        </p>
        <div className="space-y-1 text-xs">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-0.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-muted-foreground">{entry.name}:</span>
              </div>
              <span className="font-semibold">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function TeamPerformanceChart({ data, className }: TeamPerformanceChartProps) {
  const chartData = useMemo(() => {
    return data.map((member) => ({
      name: member.name,
      "Tasks Completed": member.tasksCompleted,
      "Tasks Created": member.tasksCreated,
      "Comments": member.commentsAdded,
      "Productivity": member.productivity,
    }));
  }, [data]);

  if (data.length === 0) {
    return (
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <Card className={className}>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Team Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
              No data available
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={transitions.default}
    >
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Team Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="w-full h-80 min-w-0 min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={320}>
              <RadarChart data={chartData}>
                <PolarGrid stroke="hsl(var(--border))" opacity={0.3} />
                <PolarAngleAxis
                  dataKey="name"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                />
                <Radar
                  name="Performance"
                  dataKey="Tasks Completed"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Created"
                  dataKey="Tasks Created"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.4}
                  strokeOpacity={0.7}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(value) => (
                    <span className="text-xs text-muted-foreground">{value}</span>
                  )}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


