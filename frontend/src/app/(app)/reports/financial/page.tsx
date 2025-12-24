"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import { Progress } from "@/components/atoms/progress";
import { cn } from "@/lib/utils";
import {
  Download,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Target,
  BarChart3,
  PieChart,
  LineChart as LineChartIcon,
  Lightbulb,
  AlertTriangle,
  Info,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { useCosts } from "@/hooks/use-costs";
import { useExpenses } from "@/hooks/use-expenses";
import { useBudgets } from "@/hooks/use-budgets";
import { useProjects } from "@/hooks/use-projects";
import { ProjectCostAnalysis } from "@/components/molecules/project-cost-analysis";
import { calculateFinancialAnalytics } from "@/core/services/analytics";
import { formatCurrency } from "@/shared/utils/format";
import { COST_CATEGORIES } from "@/core/config/constants";
import { LoadingScreen } from "@/components/atoms/loading-screen";
import { fadeInUp, transitions } from "@/lib/motion";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart as RechartsPieChart,
  Pie,
  Legend,
  AreaChart,
  Area,
  Line,
} from "recharts";

export default function FinancialReportsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();
  const { costs, isLoading: isLoadingCosts } = useCosts();
  const { expenses, isLoading: isLoadingExpenses } = useExpenses();
  const { budgets, isLoading: isLoadingBudgets } = useBudgets();
  const { projects } = useProjects();

  const isLoading = isLoadingCosts || isLoadingExpenses || isLoadingBudgets;

  // Filter data by selected project
  const filteredCosts = useMemo(() => {
    if (!selectedProjectId) return costs;
    if (selectedProjectId === "unassigned") {
      return costs.filter((c) => !c.projectId);
    }
    return costs.filter((c) => c.projectId === selectedProjectId);
  }, [costs, selectedProjectId]);

  const filteredExpenses = useMemo(() => {
    if (!selectedProjectId) return expenses;
    if (selectedProjectId === "unassigned") {
      return expenses.filter((e) => !e.projectId);
    }
    return expenses.filter((e) => e.projectId === selectedProjectId);
  }, [expenses, selectedProjectId]);

  const filteredBudgets = useMemo(() => {
    if (!selectedProjectId) return budgets;
    if (selectedProjectId === "unassigned") {
      return budgets.filter((b) => !b.projectId);
    }
    return budgets.filter((b) => b.projectId === selectedProjectId);
  }, [budgets, selectedProjectId]);

  const analytics = useMemo(() => {
    return calculateFinancialAnalytics(filteredCosts, filteredExpenses, filteredBudgets);
  }, [filteredCosts, filteredExpenses, filteredBudgets]);

  // Calculate financial health
  const financialHealth = useMemo(() => {
    const totalSpending = analytics.totalCosts + analytics.totalExpenses;
    const netBudget = analytics.totalBudgets - totalSpending;
    const savingsRate = analytics.totalBudgets > 0 ? ((netBudget / analytics.totalBudgets) * 100) : 0;
    const overBudgetCategories = analytics.budgetVsActual.filter(
      (bva) => bva.actual > bva.budgeted && bva.budgeted > 0
    ).length;

    return {
      totalSpending,
      netBudget,
      savingsRate,
      overBudgetCategories,
      isHealthy: savingsRate >= 0 && overBudgetCategories === 0,
      utilization: analytics.budgetUtilization,
    };
  }, [analytics]);

  // Generate insights
  const insights = useMemo(() => {
    const insightsList: Array<{
      type: "warning" | "success" | "info";
      title: string;
      message: string;
      icon: React.ReactNode;
    }> = [];

    if (financialHealth.utilization > 100) {
      insightsList.push({
        type: "warning",
        title: "Over Budget",
        message: `You've exceeded your total budget by ${(financialHealth.utilization - 100).toFixed(1)}%. Review spending immediately.`,
        icon: <AlertTriangle className="h-5 w-5" />,
      });
    } else if (financialHealth.utilization > 80) {
      insightsList.push({
        type: "warning",
        title: "Approaching Budget Limit",
        message: `You've used ${financialHealth.utilization.toFixed(1)}% of your budget. Monitor spending closely.`,
        icon: <AlertCircle className="h-5 w-5" />,
      });
    } else if (financialHealth.utilization < 50) {
      insightsList.push({
        type: "success",
        title: "Well Within Budget",
        message: `You're using only ${financialHealth.utilization.toFixed(1)}% of your budget. Great financial discipline!`,
        icon: <CheckCircle2 className="h-5 w-5" />,
      });
    }

    if (financialHealth.overBudgetCategories > 0) {
      const topOverBudget = analytics.budgetVsActual
        .filter((bva) => bva.actual > bva.budgeted && bva.budgeted > 0)
        .sort((a, b) => b.variance - a.variance)[0];
      const category = COST_CATEGORIES.find((c) => c.value === topOverBudget.category);
      insightsList.push({
        type: "warning",
        title: "Category Over Budget",
        message: `${category?.label || topOverBudget.category} is over budget by ${formatCurrency(Math.abs(topOverBudget.variance), "USD")}.`,
        icon: <AlertTriangle className="h-5 w-5" />,
      });
    }

    if (analytics.topCategories.length > 0) {
      const topCategory = analytics.topCategories[0];
      const percentage = (topCategory.total / (analytics.totalCosts + analytics.totalExpenses)) * 100;
      if (percentage > 30) {
        const category = COST_CATEGORIES.find((c) => c.value === topCategory.category);
        insightsList.push({
          type: "info",
          title: "High Spending Category",
          message: `${category?.label || topCategory.category} accounts for ${percentage.toFixed(1)}% of total spending.`,
          icon: <Info className="h-5 w-5" />,
        });
      }
    }

    return insightsList;
  }, [financialHealth, analytics]);

  const handleDownloadPDF = async () => {
    try {
      const { downloadFinancialReportPDF } = await import("@/shared/utils/pdf");
      await downloadFinancialReportPDF(
        filteredCosts,
        filteredExpenses,
        filteredBudgets,
        analytics,
        selectedProjectId ? `Financial Report - ${projects.find(p => p.uid === selectedProjectId)?.name || "Project"}` : "Financial Report"
      );
      toast.success("Financial report downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF report");
    }
  };

  if (isLoading) {
    return <LoadingScreen type="dashboard" />;
  }

  return (
    <div className="space-y-6 bg-[#F7F9FC] dark:bg-background min-h-screen p-6">
      <div className="max-w-[1920px] mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-1">
              Financial Reports
            </h1>
            <p className="text-sm text-muted-foreground">
              Comprehensive financial analysis and insights • Last updated {format(new Date(), "MMM d, h:mm a")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 gap-2 hover:bg-muted/50 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="text-sm">Refresh</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="h-8 px-3 gap-2">
              <Download className="h-4 w-4" />
              <span className="text-sm">Export</span>
            </Button>
          </div>
        </motion.div>

        {/* Project Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <ProjectCostAnalysis
            costs={costs}
            expenses={expenses}
            budgets={budgets}
            selectedProjectId={selectedProjectId}
            onProjectSelect={setSelectedProjectId}
          />
        </motion.div>

        {/* Top KPI Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2"
        >
          <Card className="border border-border/40 bg-card hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Total Budget</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(analytics.totalBudgets, "USD")}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/40 bg-card hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Total Spending</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(financialHealth.totalSpending, "USD")}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/40 bg-card hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Remaining</p>
                  <p
                    className={cn(
                      "text-2xl font-bold",
                      financialHealth.netBudget >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    )}
                  >
                    {formatCurrency(financialHealth.netBudget, "USD")}
                  </p>
                </div>
                <div
                  className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center",
                    financialHealth.netBudget >= 0
                      ? "bg-emerald-500/10"
                      : "bg-red-500/10"
                  )}
                >
                  {financialHealth.netBudget >= 0 ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/40 bg-card hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Budget Utilization</p>
                  <p
                    className={cn(
                      "text-2xl font-bold",
                      financialHealth.utilization >= 90
                        ? "text-red-600 dark:text-red-400"
                        : financialHealth.utilization >= 70
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-emerald-600 dark:text-emerald-400"
                    )}
                  >
                    {financialHealth.utilization.toFixed(1)}%
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <Progress
                value={Math.min(financialHealth.utilization, 100)}
                className={cn(
                  "h-1.5 mt-3",
                  financialHealth.utilization >= 90 && "[&>div]:bg-red-500",
                  financialHealth.utilization >= 70 &&
                    financialHealth.utilization < 90 &&
                    "[&>div]:bg-amber-500",
                  financialHealth.utilization < 70 && "[&>div]:bg-emerald-500"
                )}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Financial Health Status */}
        <motion.div
          variants={fadeInUp}
          transition={{ ...transitions.default, delay: 0.3 }}
          className="col-span-12"
        >
          <Card
            className={cn(
              "border hover:shadow-md transition-all duration-200",
              financialHealth.isHealthy
                ? "border-emerald-500/20 bg-emerald-500/5"
                : "border-red-500/20 bg-red-500/5"
            )}
          >
            <CardHeader className="pb-3 px-4 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    {financialHealth.isHealthy ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                    Financial Health Status
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {financialHealth.isHealthy
                      ? "Your finances are in good shape"
                      : "Action needed to improve financial health"}
                  </CardDescription>
                </div>
                <Badge
                  variant={financialHealth.isHealthy ? "default" : "destructive"}
                  className="gap-2"
                >
                  {financialHealth.isHealthy ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Healthy
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4" />
                      Needs Attention
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-lg bg-background/50 border border-border/40">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Total Budget</p>
                  <p className="text-lg font-bold text-foreground">
                    {formatCurrency(analytics.totalBudgets, "USD")}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/40">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Total Spending</p>
                  <p className="text-lg font-bold text-foreground">
                    {formatCurrency(financialHealth.totalSpending, "USD")}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/40">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Remaining</p>
                  <p
                    className={cn(
                      "text-lg font-bold",
                      financialHealth.netBudget >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    )}
                  >
                    {formatCurrency(financialHealth.netBudget, "USD")}
                  </p>
                </div>
              </div>
              {financialHealth.overBudgetCategories > 0 && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                    Warning: {financialHealth.overBudgetCategories} categor
                    {financialHealth.overBudgetCategories === 1 ? "y" : "ies"} over budget
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Review your spending in these categories to stay within budget limits.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-12 gap-2">
          {/* Budget Breakdown Chart */}
          {analytics.budgetVsActual.filter((bva) => bva.budgeted > 0).length > 0 && (
            <motion.div
              variants={fadeInUp}
              transition={{ ...transitions.default, delay: 0.4 }}
              className="col-span-12 lg:col-span-4"
            >
              <Card className="h-full border border-border/40 bg-card hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3 px-4 pt-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Budget vs Spent
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">By category</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 px-4 pb-4">
                  <div className="w-full h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analytics.budgetVsActual
                          .filter((bva) => bva.budgeted > 0)
                          .slice(0, 6)}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                          opacity={0.2}
                          vertical={false}
                        />
                        <XAxis
                          dataKey="category"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          width={50}
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                          tickFormatter={(value) => `$${value / 1000}k`}
                        />
                        <Tooltip
                          formatter={(value: any) => {
                            const numeric = Number(Array.isArray(value) ? value[0] : value);
                            if (Number.isNaN(numeric)) return "";
                            return `$${numeric.toLocaleString()}`;
                          }}
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            padding: "8px",
                          }}
                        />
                        <Bar dataKey="budgeted" stackId="a" radius={[0, 0, 0, 0]}>
                          {analytics.budgetVsActual
                            .filter((bva) => bva.budgeted > 0)
                            .slice(0, 6)
                            .map((entry, index) => (
                              <Cell
                                key={`budget-${index}`}
                                fill="hsl(var(--primary) / 0.15)"
                              />
                            ))}
                        </Bar>
                        <Bar dataKey="actual" stackId="a" radius={[4, 4, 0, 0]}>
                          {analytics.budgetVsActual
                            .filter((bva) => bva.budgeted > 0)
                            .slice(0, 6)
                            .map((entry, index) => (
                              <Cell
                                key={`spent-${index}`}
                                fill={
                                  entry.percentage >= 90
                                    ? "hsl(var(--destructive))"
                                    : entry.percentage >= 70
                                      ? "hsl(var(--warning))"
                                      : "hsl(var(--primary) / 0.7)"
                                }
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

          {/* Category Distribution */}
          {analytics.categoryBreakdown.filter((cb) => cb.costs > 0 || cb.expenses > 0).length > 0 && (
            <motion.div
              variants={fadeInUp}
              transition={{ ...transitions.default, delay: 0.45 }}
              className="col-span-12 lg:col-span-4"
            >
              <Card className="h-full border border-border/40 bg-card hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3 px-4 pt-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-primary" />
                    Category Distribution
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">Spending by category</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 px-4 pb-4">
                  <div className="w-full h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={analytics.categoryBreakdown
                            .filter((cb) => cb.costs > 0 || cb.expenses > 0)
                            .slice(0, 6)
                            .map((cb) => ({
                              name: COST_CATEGORIES.find((c) => c.value === cb.category)?.label || cb.category,
                              value: cb.costs + cb.expenses,
                            }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }: any) =>
                            name && percent ? `${name}: ${(percent * 100).toFixed(0)}%` : ""
                          }
                          outerRadius={50}
                          fill="#8884d8"
                          dataKey="value"
                          stroke="hsl(var(--card))"
                          strokeWidth={2}
                        >
                          {analytics.categoryBreakdown
                            .filter((cb) => cb.costs > 0 || cb.expenses > 0)
                            .slice(0, 6)
                            .map((entry, index) => {
                              const colors = [
                                "hsl(var(--primary))",
                                "hsl(var(--primary) / 0.8)",
                                "hsl(var(--primary) / 0.6)",
                                "hsl(var(--primary) / 0.4)",
                                "hsl(var(--primary) / 0.2)",
                                "hsl(var(--primary) / 0.15)",
                              ];
                              return (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                              );
                            })}
                        </Pie>
                        <Tooltip
                          formatter={(value: any) => {
                            const numeric = Number(Array.isArray(value) ? value[0] : value);
                            if (Number.isNaN(numeric)) return "";
                            return `$${numeric.toLocaleString()}`;
                          }}
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            padding: "8px",
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: "12px", marginTop: "4px" }} iconType="circle" />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Monthly Trend */}
          {analytics.monthlyTrend.length > 0 && (
            <motion.div
              variants={fadeInUp}
              transition={{ ...transitions.default, delay: 0.5 }}
              className="col-span-12 lg:col-span-4"
            >
              <Card className="h-full border border-border/40 bg-card hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3 px-4 pt-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <LineChartIcon className="h-4 w-4 text-primary" />
                    Monthly Trend
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">Last 6 months</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 px-4 pb-4">
                  <div className="w-full h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={analytics.monthlyTrend}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
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
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          width={50}
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                          tickFormatter={(value) => `$${value / 1000}k`}
                        />
                        <Tooltip
                          formatter={(value: any) => `$${Number(value).toLocaleString()}`}
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            padding: "8px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="costs"
                          stackId="1"
                          stroke="hsl(var(--primary))"
                          fill="url(#trendGradient)"
                          strokeWidth={2.5}
                        />
                        <Area
                          type="monotone"
                          dataKey="expenses"
                          stackId="1"
                          stroke="hsl(var(--primary) / 0.7)"
                          fill="url(#trendGradient)"
                          strokeWidth={2.5}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Insights Section */}
        {insights.length > 0 && (
          <motion.div
            variants={fadeInUp}
            transition={{ ...transitions.default, delay: 0.55 }}
            className="col-span-12"
          >
            <Card className="border border-border/40 bg-card hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3 px-4 pt-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  Financial Insights & Recommendations
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  AI-powered insights to help you make better financial decisions
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 px-4 pb-4">
                <div className="space-y-2">
                  {insights.map((insight, index) => (
                    <div
                      key={index}
                      className={cn(
                        "p-4 rounded-lg border",
                        insight.type === "warning"
                          ? "border-red-500/20 bg-red-500/5"
                          : insight.type === "success"
                            ? "border-emerald-500/20 bg-emerald-500/5"
                            : "border-blue-500/20 bg-blue-500/5"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-lg flex-shrink-0",
                            insight.type === "warning"
                              ? "bg-red-500/10"
                              : insight.type === "success"
                                ? "bg-emerald-500/10"
                                : "bg-blue-500/10"
                          )}
                        >
                          <div
                            className={cn(
                              insight.type === "warning"
                                ? "text-red-600 dark:text-red-400"
                                : insight.type === "success"
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-blue-600 dark:text-blue-400"
                            )}
                          >
                            {insight.icon}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-foreground">{insight.title}</p>
                            <Badge
                              variant={
                                insight.type === "warning"
                                  ? "destructive"
                                  : insight.type === "success"
                                    ? "default"
                                    : "secondary"
                              }
                              className="text-xs"
                            >
                              {insight.type === "warning"
                                ? "Warning"
                                : insight.type === "success"
                                  ? "Success"
                                  : "Info"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{insight.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Budget Performance by Category */}
        <motion.div
          variants={fadeInUp}
          transition={{ ...transitions.default, delay: 0.6 }}
          className="col-span-12"
        >
          <Card className="border border-border/40 bg-card hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3 px-4 pt-4">
              <CardTitle className="text-base font-semibold">Budget Performance by Category</CardTitle>
              <CardDescription className="text-sm mt-1">
                Track how well you're staying within budget limits
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-4">
              <div className="space-y-3">
                {analytics.budgetVsActual
                  .filter((bva) => bva.budgeted > 0)
                  .map((bva) => {
                    const category = COST_CATEGORIES.find((c) => c.value === bva.category);
                    const isOverBudget = bva.actual > bva.budgeted;
                    const utilization = bva.percentage;
                    return (
                      <div key={bva.category} className="space-y-2 p-3 rounded-lg border border-border/40 bg-muted/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {category?.label || bva.category}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {utilization.toFixed(1)}% of budget used
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Budget</p>
                              <p className="text-sm font-semibold text-foreground">
                                {formatCurrency(bva.budgeted, "USD")}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Actual</p>
                              <p
                                className={cn(
                                  "text-sm font-semibold",
                                  isOverBudget
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-emerald-600 dark:text-emerald-400"
                                )}
                              >
                                {formatCurrency(bva.actual, "USD")}
                              </p>
                            </div>
                            <Badge variant={isOverBudget ? "destructive" : "secondary"}>
                              {isOverBudget ? "+" : ""}
                              {formatCurrency(Math.abs(bva.variance), "USD")}
                            </Badge>
                          </div>
                        </div>
                        <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/50">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(utilization, 100)}%` }}
                            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                            className={cn(
                              "h-full rounded-full transition-colors",
                              isOverBudget
                                ? "bg-red-500"
                                : utilization > 80
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                            )}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
