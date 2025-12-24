"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { cn } from "@/lib/utils";
import { fadeInUp, transitions } from "@/lib/motion";
import { PieChart as PieChartIcon, DollarSign } from "lucide-react";
import { formatCurrency } from "@/shared/utils/format";

export interface CostBreakdownData {
  category: string;
  amount: number;
  color?: string;
}

export interface CostBreakdownChartProps {
  data: CostBreakdownData[];
  className?: string;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--primary) / 0.9)",
  "hsl(var(--primary) / 0.8)",
  "hsl(var(--primary) / 0.7)",
  "hsl(var(--primary) / 0.6)",
  "hsl(var(--primary) / 0.5)",
  "hsl(var(--primary) / 0.4)",
  "hsl(var(--primary) / 0.3)",
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const total = payload.reduce((sum: number, p: any) => sum + p.value, 0);
    const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : "0";
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3 z-50">
        <p className="text-xs font-semibold text-foreground mb-1">
          {data.name}
        </p>
        <p className="text-sm font-bold text-primary">
          {formatCurrency(data.value, "USD")}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {percentage}% of total
        </p>
      </div>
    );
  }
  return null;
};

export function CostBreakdownChart({ data, className }: CostBreakdownChartProps) {
  const chartData = useMemo(() => {
    return data.map((item, index) => ({
      name: item.category,
      value: item.amount,
      color: item.color || COLORS[index % COLORS.length],
    }));
  }, [data]);

  const total = useMemo(() => {
    return data.reduce((sum, item) => sum + item.amount, 0);
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
              <PieChartIcon className="h-5 w-5 text-primary" />
              Cost Breakdown
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
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Cost Breakdown
            </CardTitle>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-xl font-bold">{formatCurrency(total, "USD")}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="w-full h-80 min-w-0 min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={320}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry: any) => (
                    <span className="text-xs text-muted-foreground">
                      {value} ({formatCurrency(entry.payload.value, "USD")})
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


