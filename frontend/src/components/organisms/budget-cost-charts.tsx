"use client";

import { memo, useMemo } from "react";
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
  PieChart,
  Pie,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { BudgetCostMetrics } from "@/interfaces/dashboard.interface";
import { cn } from "@/lib/utils";
import { fadeInUp, transitions } from "@/lib/motion";
import { DollarSign, TrendingUp, TrendingDown, LineChart as LineChartIcon } from "lucide-react";

export interface BudgetCostChartsProps {
  data: BudgetCostMetrics;
  className?: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3 z-50">
        <p className="text-xs font-semibold text-foreground mb-2">
          {data.projectName || data.name}
        </p>
        <div className="space-y-1 text-xs">
          {data.budget !== undefined && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Budget:</span>
              <span className="font-semibold">${data.budget.toLocaleString()}</span>
            </div>
          )}
          {data.spent !== undefined && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Spent:</span>
              <span className="font-semibold">${data.spent.toLocaleString()}</span>
            </div>
          )}
          {data.remaining !== undefined && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Remaining:</span>
              <span className="font-semibold">${data.remaining.toLocaleString()}</span>
            </div>
          )}
          {data.utilization !== undefined && (
            <div className="flex items-center justify-between gap-4 pt-1 border-t border-border">
              <span className="text-muted-foreground">Utilization:</span>
              <span className="font-semibold">{data.utilization.toFixed(1)}%</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const BudgetCostCharts = memo(function BudgetCostCharts({ data, className }: BudgetCostChartsProps) {
  const barChartData = useMemo(() => {
    return data.projectBudgets.map((pb) => ({
      name: pb.projectName.length > 12 ? pb.projectName.substring(0, 12) + "..." : pb.projectName,
      projectName: pb.projectName,
      budget: pb.budget,
      spent: pb.spent,
      remaining: pb.remaining,
      utilization: pb.utilization,
    }));
  }, [data.projectBudgets]);

  const pieData = useMemo(() => {
    if (data.totalBudget === 0) return [];
    return [
      {
        name: "Spent",
        value: data.totalSpent,
        color: "hsl(var(--primary) / 0.6)",
      },
      {
        name: "Remaining",
        value: Math.max(0, data.remainingBudget),
        color: "hsl(var(--primary) / 0.2)",
      },
    ];
  }, [data]);

  const maxValue = useMemo(() => {
    if (barChartData.length === 0) return 1000;
    const max = Math.max(
      ...barChartData.map((d) => Math.max(d.budget, d.spent)),
      data.totalBudget
    );
    return Math.ceil(max / 1000) * 1000;
  }, [barChartData, data.totalBudget]);

  if (data.totalBudget === 0 && data.totalSpent === 0) {
    return (
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className={className}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Budget & Cost Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
              No budget data available
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <>
      {/* Budget Breakdown Chart */}
      {barChartData.length > 0 && (
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ ...transitions.default, delay: 0.2 }}
          className="col-span-12 lg:col-span-4"
        >
          <Card className="relative overflow-hidden border border-border/40 bg-card hover:shadow-md transition-all duration-200">
            <CardHeader className="relative z-10 pb-3 px-4 pt-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Budget Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 p-5 pt-0">
              <div className="w-full min-w-0" style={{ height: '240px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke="hsl(var(--border))"
                      opacity={0.1}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      fontWeight={600}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      fontWeight={600}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(value) => `$${value / 1000}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="budget" stackId="a" radius={[0, 0, 0, 0]} barSize={32}>
                      {barChartData.map((entry, index) => (
                        <Cell
                          key={`budget-${index}`}
                          fill="hsl(var(--primary) / 0.1)"
                        />
                      ))}
                    </Bar>
                    <Bar dataKey="spent" stackId="a" radius={[4, 4, 0, 0]} barSize={32}>
                      {barChartData.map((entry, index) => (
                        <Cell
                          key={`spent-${index}`}
                          fill={
                            entry.utilization >= 90
                              ? "hsl(var(--destructive))"
                              : entry.utilization >= 70
                                ? "hsl(var(--warning))"
                                : "hsl(var(--primary))"
                          }
                          fillOpacity={0.8}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Budget Distribution Pie Chart - Enhanced */}
      {pieData.length > 0 && (
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ ...transitions.default, delay: 0.3 }}
          className="col-span-12 lg:col-span-4"
        >
          <Card className="relative overflow-hidden border border-border/40 bg-card hover:shadow-md transition-all duration-200">
            <CardHeader className="relative z-10 pb-3 px-4 pt-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-primary" />
                Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 p-5 pt-0">
              <div className="w-full min-w-0" style={{ height: '240px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }: any) =>
                        name && percent ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                      }
                      outerRadius={80}
                      innerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number | undefined) => value ? `$${value.toLocaleString()}` : ''}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        padding: "8px",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      align="center"
                      iconType="circle"
                      wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 600 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Cost Trend Chart - Enhanced */}
      {data.costTrend && data.costTrend.length > 0 && (
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ ...transitions.default, delay: 0.4 }}
          className="col-span-12 lg:col-span-4"
        >
          <Card className="relative overflow-hidden border border-border/40 bg-card hover:shadow-md transition-all duration-200">
            <CardHeader className="relative z-10 pb-3 px-4 pt-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <LineChartIcon className="h-4 w-4 text-primary" />
                Cost Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 p-5 pt-0">
              <div className="w-full min-w-0" style={{ height: '240px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={data.costTrend}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
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
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      fontWeight={600}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(value) => `$${value / 1000}k`}
                    />
                    <Tooltip
                      formatter={(value: any, name: any) => {
                        const formattedValue = value ? `$${Number(value).toLocaleString()}` : '$0';
                        const label = name === "cost" ? "Costs" : name === "expense" ? "Expenses" : "Total";
                        return [formattedValue, label];
                      }}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        padding: "8px",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="cost"
                      stroke="hsl(var(--primary))"
                      fill="url(#costGradient)"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", r: 4, strokeWidth: 2, stroke: "hsl(var(--card))" }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

    </> 
  );
});


