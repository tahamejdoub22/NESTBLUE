"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Progress } from "@/components/atoms/progress";
import { Badge } from "@/components/atoms/badge";
import { StatCard } from "@/components/molecules/stat-card";
import { ProjectFinancialSummary, ProjectCostBreakdown, ProjectTaskEstimate } from "@/interfaces/project.interface";
import { DollarSign, TrendingUp, TrendingDown, Target, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectCostBudgetProps {
  summary: ProjectFinancialSummary;
  breakdown: ProjectCostBreakdown[];
  taskEstimates: ProjectTaskEstimate[];
  className?: string;
}

export function ProjectCostBudget({
  summary,
  breakdown,
  taskEstimates,
  className,
}: ProjectCostBudgetProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: summary.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const isOverBudget = summary.budgetUtilization > 100;
  const isNearBudget = summary.budgetUtilization > 80 && summary.budgetUtilization <= 100;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Budget"
          value={formatCurrency(summary.totalBudget)}
          icon={Target}
          variant="gradient"
          description="Allocated budget for this project"
        />
        <StatCard
          title="Total Spent"
          value={formatCurrency(summary.totalSpent)}
          icon={DollarSign}
          change={{
            value: summary.budgetUtilization,
            trend: isOverBudget ? "down" : isNearBudget ? "stable" : "up",
          }}
          description={`${summary.budgetUtilization.toFixed(1)}% of budget used`}
        />
        <StatCard
          title="Task Estimates"
          value={formatCurrency(summary.totalEstimated)}
          icon={TrendingUp}
          description="Estimated costs from tasks"
        />
        <StatCard
          title="Remaining"
          value={formatCurrency(summary.remaining)}
          icon={isOverBudget ? AlertCircle : TrendingDown}
          variant={isOverBudget ? "muted" : "default"}
          description={
            isOverBudget
              ? `Over budget by ${formatCurrency(Math.abs(summary.remaining))}`
              : "Available budget"
          }
        />
      </div>

      {/* Budget Utilization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Budget Utilization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Budget Usage</span>
              <span className={cn(
                "font-semibold",
                isOverBudget && "text-red-600 dark:text-red-400",
                isNearBudget && "text-yellow-600 dark:text-yellow-400"
              )}>
                {summary.budgetUtilization.toFixed(1)}%
              </span>
            </div>
            <Progress
              value={Math.min(summary.budgetUtilization, 100)}
              className={cn(
                "h-3",
                isOverBudget && "[&>div]:bg-red-500",
                isNearBudget && "[&>div]:bg-yellow-500"
              )}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-2xl font-bold">{formatCurrency(summary.totalBudget)}</p>
              <p className="text-xs text-muted-foreground mt-1">Budgeted</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{formatCurrency(summary.totalSpent)}</p>
              <p className="text-xs text-muted-foreground mt-1">Spent</p>
            </div>
            <div className="text-center">
              <p className={cn(
                "text-2xl font-bold",
                isOverBudget ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
              )}>
                {formatCurrency(summary.remaining)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Remaining</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown by Category */}
      {breakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Cost Breakdown by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {breakdown.map((item) => (
                <div key={item.category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">{item.category}</span>
                      {item.estimated > 0 && (
                        <Badge variant="outline" className="text-xs">
                          +{formatCurrency(item.estimated)} est.
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">
                        {formatCurrency(item.spent)} / {formatCurrency(item.budgeted)}
                      </span>
                      <span className="font-semibold">{item.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Estimates */}
      {taskEstimates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Task Cost Estimates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {taskEstimates.map((task) => (
                <div
                  key={task.taskId}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{task.taskTitle}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs capitalize">
                        {task.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="font-semibold text-sm">
                      {formatCurrency(task.estimatedCost.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total Estimated</span>
                <span className="text-lg font-bold">
                  {formatCurrency(summary.totalEstimated)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Variance Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Variance Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">Estimated Completion</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.estimatedCompletion)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Spent + Task Estimates
              </p>
            </div>
            <div className={cn(
              "p-4 rounded-lg border",
              summary.variance < 0
                ? "border-red-500/30 bg-red-500/10"
                : "border-emerald-500/30 bg-emerald-500/10"
            )}>
              <p className="text-xs text-muted-foreground mb-1">Variance</p>
              <p className={cn(
                "text-2xl font-bold",
                summary.variance < 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
              )}>
                {formatCurrency(summary.variance)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Budget - Estimated
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

