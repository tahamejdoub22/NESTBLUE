"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { cn } from "@/lib/utils";
import { fadeInUp, transitions } from "@/lib/motion";
import { BarChart3, CheckCircle2, Clock, Circle, Archive } from "lucide-react";

export interface TaskStatusData {
  todo: number;
  inProgress: number;
  complete: number;
  backlog: number;
}

export interface TaskStatusChartProps {
  data: TaskStatusData;
  className?: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3 z-50">
        <p className="text-xs font-semibold text-foreground mb-1">
          {data.payload.name}
        </p>
        <p className="text-sm font-bold text-primary">
          {data.value} {data.value === 1 ? "task" : "tasks"}
        </p>
      </div>
    );
  }
  return null;
};

const COLORS = {
  todo: "hsl(var(--primary) / 0.3)",
  inProgress: "hsl(var(--primary))",
  complete: "hsl(var(--primary) / 0.8)",
  backlog: "hsl(var(--primary) / 0.5)",
};

export function TaskStatusChart({ data, className }: TaskStatusChartProps) {
  const chartData = useMemo(() => {
    return [
      { name: "Todo", value: data.todo, color: COLORS.todo },
      { name: "In Progress", value: data.inProgress, color: COLORS.inProgress },
      { name: "Complete", value: data.complete, color: COLORS.complete },
      { name: "Backlog", value: data.backlog, color: COLORS.backlog },
    ];
  }, [data]);

  const total = data.todo + data.inProgress + data.complete + data.backlog;

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
            <BarChart3 className="h-5 w-5 text-primary" />
            Task Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="w-full h-64 min-w-0 min-h-[256px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={256}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  opacity={0.2}
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-border">
            {chartData.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="text-center"
              >
                <p className="text-2xl font-bold mb-1" style={{ color: item.color }}>
                  {item.value}
                </p>
                <p className="text-xs text-muted-foreground">{item.name}</p>
                <p className="text-xs font-medium text-muted-foreground mt-1">
                  {total > 0 ? ((item.value / total) * 100).toFixed(0) : 0}%
                </p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


