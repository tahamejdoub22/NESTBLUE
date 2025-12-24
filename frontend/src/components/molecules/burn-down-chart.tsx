"use client";

import { memo, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Dot,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { BurnDownDataPoint } from "@/interfaces/dashboard.interface";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fadeInUp, transitions } from "@/lib/motion";
import { TrendingDown, TrendingUp, Target, MoreVertical } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select";
import { Button } from "@/components/atoms/button";

export interface BurnDownChartProps {
  data: BurnDownDataPoint[];
  className?: string;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const remaining = payload.find((p: any) => p.dataKey === "remaining");
    const ideal = payload.find((p: any) => p.dataKey === "ideal");
    const variance = remaining?.value - ideal?.value || 0;

    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3 z-50">
        <p className="text-xs font-semibold text-foreground mb-2">
          {format(new Date(label), "MMM d, yyyy")}
        </p>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-primary rounded-full" />
              <span className="text-muted-foreground">Remaining:</span>
            </div>
            <span className="font-semibold text-primary">{remaining?.value}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 border-t border-dashed border-muted-foreground" />
              <span className="text-muted-foreground">Ideal:</span>
            </div>
            <span className="font-semibold">{ideal?.value}</span>
          </div>
          <div className="flex items-center justify-between gap-4 pt-1 border-t border-border">
            <span className="text-muted-foreground">Variance:</span>
            <span className="font-semibold text-primary" style={{ opacity: variance <= 0 ? 0.8 : 0.6 }}>
              {variance > 0 ? "+" : ""}{variance}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Custom dot component for data points
const CustomDot = (props: any) => {
  const { cx, cy, payload, active } = props;
  if (active) {
    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={5}
          fill="hsl(var(--primary))"
          stroke="hsl(var(--background))"
          strokeWidth={2}
        />
        <circle
          cx={cx}
          cy={cy}
          r={3}
          fill="hsl(var(--primary))"
        />
      </g>
    );
  }
  return (
    <circle
      cx={cx}
      cy={cy}
      r={3}
      fill="hsl(var(--primary))"
      className="opacity-60"
    />
  );
};

// Custom active dot for ideal line
const CustomIdealDot = (props: any) => {
  const { cx, cy, active } = props;
  if (active) {
    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={4}
          fill="hsl(var(--muted-foreground))"
          stroke="hsl(var(--background))"
          strokeWidth={2}
        />
        <circle
          cx={cx}
          cy={cy}
          r={2}
          fill="hsl(var(--muted-foreground))"
        />
      </g>
    );
  }
  return null;
};

export const BurnDownChart = memo(function BurnDownChart({ data, className }: BurnDownChartProps) {
  const [period, setPeriod] = useState("This Month");

  // Transform data for Recharts
  const chartData = useMemo(() => {
    return data.map((point) => {
      // Ensure date is a Date object
      const date = point.date instanceof Date ? point.date : new Date(point.date);
      return {
        date: date.getTime(),
        dateLabel: format(date, "MMM d"),
        remaining: point.remaining,
        ideal: point.ideal,
        variance: point.remaining - point.ideal,
      };
    });
  }, [data]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (chartData.length === 0) return null;
    const current = chartData[chartData.length - 1];
    const variance = current.remaining - current.ideal;
    const variancePercentage = current.ideal > 0
      ? ((variance / current.ideal) * 100).toFixed(1)
      : "0";
    const isOnTrack = variance <= 0;

    return {
      remaining: current.remaining,
      ideal: current.ideal,
      variance,
      variancePercentage,
      isOnTrack,
    };
  }, [chartData]);

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
              <TrendingDown className="h-5 w-5 text-primary" />
              Burn-down Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
              <Target className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm font-medium">No data available</p>
              <p className="text-xs mt-1">Start tracking tasks to see burn-down trends</p>
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
      className="h-full"
    >
      <Card className={cn("overflow-hidden h-full hover:shadow-md transition-all duration-200 flex flex-col", className)}>
        <CardHeader className="pb-3 px-4 pt-4 flex-shrink-0">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-primary" />
            Burn-down
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 px-4 pb-4 flex-1 flex flex-col min-h-0">
          {/* Statistics Cards - Compact */}
          {stats && (
            <div className="grid grid-cols-3 gap-1.5 mb-1.5 flex-shrink-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-1.5 rounded bg-muted/50 border border-border/30"
              >
                <p className="text-[10px] font-medium text-muted-foreground mb-0.5">Remaining</p>
                <p className="text-base font-bold">{stats.remaining}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="p-1.5 rounded bg-muted/50 border border-border/30"
              >
                <p className="text-[10px] font-medium text-muted-foreground mb-0.5">Ideal</p>
                <p className="text-base font-bold">{stats.ideal}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-1.5 rounded border border-primary/20 bg-primary/5"
              >
                <p className="text-[10px] font-medium text-muted-foreground mb-0.5">Variance</p>
                <p className="text-base font-bold text-primary" style={{ opacity: stats.isOnTrack ? 0.8 : 0.6 }}>
                  {stats.variance > 0 ? "+" : ""}{stats.variance}
                </p>
              </motion.div>
            </div>
          )}

          {/* Chart */}
          <div className="w-full min-w-0 flex-1" style={{ minHeight: '200px', height: '200px' }}>
            <ResponsiveContainer width="100%" height={200} minWidth={0} minHeight={200}>
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRemaining" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  opacity={0.2}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  type="number"
                  scale="time"
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return format(date, "MMM d");
                  }}
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
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} />
                {/* Area for remaining (with gradient fill) */}
                <Area
                  type="monotone"
                  dataKey="remaining"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  fill="url(#colorRemaining)"
                  dot={<CustomDot />}
                  activeDot={{ r: 6 }}
                />
                {/* Line for ideal (dashed, no fill) */}
                <Line
                  type="monotone"
                  dataKey="ideal"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  strokeOpacity={0.4}
                  strokeDasharray="5 5"
                  dot={<CustomIdealDot />}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Legend - Compact */}
          <div className="flex items-center justify-center gap-4 pt-1.5 border-t border-border/30">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="flex items-center gap-2"
            >
              <div className="w-5 h-1 bg-primary rounded-full" />
              <span className="text-[10px] font-medium text-muted-foreground">Remaining</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="flex items-center gap-1.5"
            >
              <div className="w-4 h-0.5 border-t border-dashed border-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground">Ideal</span>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});
