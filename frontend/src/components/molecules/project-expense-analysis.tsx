"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { StatCard } from "@/components/molecules/stat-card";
import { ProjectExpenseAnalysis } from "@/interfaces/project.interface";
import { Receipt, TrendingUp, Calendar, PieChart as PieChartIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectExpenseAnalysisProps {
  analysis: ProjectExpenseAnalysis;
  currency: string;
  className?: string;
}

export function ProjectExpenseAnalysisComponent({
  analysis,
  currency,
  className,
}: ProjectExpenseAnalysisProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency as any,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const maxCategoryAmount = Math.max(...analysis.byCategory.map((c) => c.amount), 0);
  const maxTrendAmount = Math.max(...analysis.trends.map((t) => t.amount), 0);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Expenses"
          value={formatCurrency(analysis.totalExpenses)}
          icon={Receipt}
          variant="gradient"
          description="All recurring expenses"
        />
        <StatCard
          title="Monthly Expenses"
          value={formatCurrency(analysis.monthlyExpenses)}
          icon={Calendar}
          description="Projected monthly cost"
        />
        <StatCard
          title="Active Expenses"
          value={analysis.byFrequency.reduce((sum, f) => sum + f.count, 0)}
          icon={PieChartIcon}
          description="Number of active expenses"
        />
      </div>

      {/* Expenses by Category */}
      {analysis.byCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.byCategory.map((item) => {
                const percentage = maxCategoryAmount > 0 ? (item.amount / maxCategoryAmount) * 100 : 0;
                return (
                  <div key={item.category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{item.category}</span>
                        <Badge variant="outline" className="text-xs">
                          {item.percentage.toFixed(1)}%
                        </Badge>
                      </div>
                      <span className="font-semibold">{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses by Frequency */}
      {analysis.byFrequency.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Expenses by Frequency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.byFrequency.map((item) => (
                <div
                  key={item.frequency}
                  className="p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize">{item.frequency}</span>
                    <Badge variant="outline" className="text-xs">
                      {item.count} {item.count === 1 ? "expense" : "expenses"}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(item.amount)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.frequency === "daily" && "per day"}
                    {item.frequency === "weekly" && "per week"}
                    {item.frequency === "monthly" && "per month"}
                    {item.frequency === "yearly" && "per year"}
                    {item.frequency === "one-time" && "one-time payment"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expense Trends */}
      {analysis.trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Expense Trends (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-64 w-full relative flex items-end justify-between gap-2">
                {analysis.trends.map((trend, index) => {
                  const height = maxTrendAmount > 0 ? (trend.amount / maxTrendAmount) * 100 : 0;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col items-center justify-end h-full">
                        <div
                          className="w-full bg-primary rounded-t-lg transition-all duration-300 hover:bg-primary/80"
                          style={{ height: `${height}%`, minHeight: height > 0 ? "4px" : "0" }}
                          title={`${trend.month}: ${formatCurrency(trend.amount)}`}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium text-muted-foreground">
                          {trend.month.split(" ")[0]}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatCurrency(trend.amount)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

