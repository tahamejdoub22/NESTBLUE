"use client";

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
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { cn } from "@/lib/utils";
import { fadeInUp, transitions } from "@/lib/motion";
import { TrendingUp, DollarSign } from "lucide-react";
import { formatCurrency } from "@/shared/utils/format";

export interface RevenueTrendDataPoint {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface RevenueTrendChartProps {
  data: RevenueTrendDataPoint[];
  className?: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3 z-50">
        <p className="text-xs font-semibold text-foreground mb-2">
          {payload[0].payload.month}
        </p>
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-primary rounded-full" />
              <span className="text-muted-foreground">Revenue:</span>
            </div>
            <span className="font-semibold text-primary">
              {formatCurrency(payload[0].value, "USD")}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: "hsl(var(--primary) / 0.7)" }} />
              <span className="text-muted-foreground">Expenses:</span>
            </div>
            <span className="font-semibold" style={{ color: "hsl(var(--primary) / 0.7)" }}>
              {formatCurrency(payload[1]?.value || 0, "USD")}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 pt-1 border-t border-border">
            <span className="text-muted-foreground">Profit:</span>
            <span className="font-semibold" style={{ color: "hsl(var(--primary) / 0.5)" }}>
              {formatCurrency(payload[2]?.value || 0, "USD")}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function RevenueTrendChart({ data, className }: RevenueTrendChartProps) {
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
              <DollarSign className="h-5 w-5 text-primary" />
              Revenue Trend
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

  const maxValue = Math.max(...data.map(d => Math.max(d.revenue, d.expenses, d.profit)));

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
            <TrendingUp className="h-5 w-5 text-primary" />
            Revenue Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="w-full h-80 min-w-0 min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={320}>
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  opacity={0.2}
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
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
                  width={60}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  fill="url(#colorRevenue)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  strokeOpacity={0.7}
                  fill="url(#colorExpenses)"
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  strokeOpacity={0.5}
                  strokeDasharray="5 5"
                  dot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-5 h-1 bg-primary rounded-full" />
              <span className="text-xs font-medium text-muted-foreground">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-1 rounded-full" style={{ backgroundColor: "hsl(var(--primary) / 0.7)" }} />
              <span className="text-xs font-medium text-muted-foreground">Expenses</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-1 border-t-2 border-dashed" style={{ borderColor: "hsl(var(--primary) / 0.5)" }} />
              <span className="text-xs font-medium text-muted-foreground">Profit</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


