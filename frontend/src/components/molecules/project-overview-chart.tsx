"use client";

import { useMemo, useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/atoms/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select";
import { cn } from "@/lib/utils";
import { fadeInUp, transitions } from "@/lib/motion";
import { BarChart3, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { projectOverviewApi } from "@/core/services/api-helpers";

export interface ProjectOverviewDataPoint {
  month: string;
  completed: number;
  total: number;
  isHighlighted?: boolean;
  isProjected?: boolean;
}

export interface ProjectOverviewChartProps {
  data?: ProjectOverviewDataPoint[];
  className?: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const completed = payload.find((p: any) => p.dataKey === "completed")?.value || 0;
    const remaining = payload.find((p: any) => p.dataKey === "remaining")?.value || 0;
    const total = completed + remaining;
    return (
      <div className="bg-card/95 backdrop-blur-xl border border-border/40 rounded-xl shadow-2xl p-4 z-50 min-w-[160px]">
        <p className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          {data.month}
        </p>
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-muted-foreground font-medium">Completed:</span>
            </div>
            <span className="font-bold text-foreground">{completed}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-primary/20" />
              <span className="text-muted-foreground font-medium">Remaining:</span>
            </div>
            <span className="font-bold text-foreground">{remaining}</span>
          </div>
          <div className="flex items-center justify-between gap-4 pt-2.5 border-t border-border/40">
            <span className="text-muted-foreground font-bold">Total:</span>
            <span className="font-black text-primary text-sm">{total}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function ProjectOverviewChart({ data: propData, className }: ProjectOverviewChartProps) {
  const [period, setPeriod] = useState<"week" | "month" | "year">("month");

  // Fetch data from backend
  const { data: backendData, isLoading } = useQuery({
    queryKey: ["project-overview", period],
    queryFn: async () => {
      try {
        const result = await projectOverviewApi.getData(period);
        return result;
      } catch (err) {
        console.error('[ProjectOverview] Fetch error:', err);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !propData, // Only fetch if no prop data provided
  });

  const data = propData || backendData || [];

  const chartData = useMemo(() => {
    return data.map((item) => ({
      month: item.month,
      completed: item.completed,
      remaining: item.total - item.completed, // Remaining part
      total: item.total,
      isHighlighted: item.isHighlighted,
      isProjected: item.isProjected,
    }));
  }, [data]);

  const maxValue = useMemo(() => {
    const max = Math.max(...data.map((d) => d.total), 600);
    return Math.ceil(max / 100) * 100;
  }, [data]);

  const yAxisTicks = useMemo(() => {
    const ticks = [];
    const step = maxValue / 4;
    for (let i = 0; i <= 4; i++) {
      ticks.push(Math.round(i * step));
    }
    return ticks;
  }, [maxValue]);

  if (isLoading && !propData) {
    return (
      <Card className={cn("overflow-hidden h-[400px] border border-border/40 bg-card", className)}>
        <CardHeader className="pb-4">
          <div className="h-6 w-32 bg-muted rounded-md animate-pulse" />
        </CardHeader>
        <CardContent className="h-full flex items-center justify-center">
          <div className="h-40 w-full bg-muted/30 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={transitions.default}
      className="h-full"
    >
      <Card className={cn("overflow-hidden h-full border border-border/40 bg-card hover:shadow-lg transition-all duration-300", className)}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                Project Execution
              </CardTitle>
              <CardDescription>Performance tracking over time</CardDescription>
            </div>
            <Select 
              value={period} 
              onValueChange={(value) => setPeriod(value as "week" | "month" | "year")}
            >
              <SelectTrigger className="w-[120px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Weekly</SelectItem>
                <SelectItem value="month">Monthly</SelectItem>
                <SelectItem value="year">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="w-full" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                barCategoryGap="30%"
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="hsl(var(--border))"
                  opacity={0.1}
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, maxValue]}
                  ticks={yAxisTicks}
                />
                <Tooltip 
                  content={<CustomTooltip />} 
                  cursor={{ fill: 'hsl(var(--primary) / 0.05)', radius: 8 }}
                />
                <Bar
                  dataKey="completed"
                  stackId="a"
                  radius={[0, 0, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`completed-${index}`}
                      fill={entry.isProjected ? "transparent" : "hsl(var(--primary))"}
                      fillOpacity={entry.isHighlighted ? 0.9 : 0.7}
                      stroke={entry.isProjected ? "hsl(var(--primary))" : "none"}
                      strokeDasharray={entry.isProjected ? "4 4" : "0"}
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey="remaining"
                  stackId="a"
                  radius={[6, 6, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`remaining-${index}`}
                      fill={entry.isProjected ? "transparent" : "hsl(var(--primary))"}
                      fillOpacity={0.15}
                      stroke={entry.isProjected ? "hsl(var(--primary))" : "none"}
                      strokeDasharray={entry.isProjected ? "4 4" : "0"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
