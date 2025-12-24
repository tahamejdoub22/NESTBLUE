"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layouts/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { StatCard } from "@/components/molecules/stat-card";
import { Button } from "@/components/atoms/button";
import { Download, TrendingUp, TrendingDown, Target, DollarSign } from "lucide-react";
import { useCosts } from "@/hooks/use-costs";
import { useExpenses } from "@/hooks/use-expenses";
import { useBudgets } from "@/hooks/use-budgets";
import { useProjects } from "@/hooks/use-projects";
import { ProjectCostAnalysis } from "@/components/molecules/project-cost-analysis";
import { calculateFinancialAnalytics } from "@/core/services/analytics";
import { formatCurrency } from "@/shared/utils/format";
import { COST_CATEGORIES } from "@/core/config/constants";
import { Text } from "@/components/atoms/text";
import { Badge } from "@/components/atoms/badge";
import { Progress } from "@/components/atoms/progress";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/atoms/loading-screen";
import { fadeInUp, staggerContainer, staggerItem, progressBar, transitions } from "@/lib/motion";

export default function AnalyticsReportsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();
  // Use hooks to ensure data is fetched from backend
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

  const handleDownloadPDF = async () => {
    try {
      const { downloadAnalyticsReportPDF } = await import("@/shared/utils/pdf");
      await downloadAnalyticsReportPDF(
        filteredCosts,
        filteredExpenses,
        filteredBudgets,
        analytics,
        selectedProjectId ? `Analytics Report - ${projects.find(p => p.uid === selectedProjectId)?.name || "Project"}` : "Analytics Report"
      );
      toast.success("Analytics report downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF report");
    }
  };

  if (isLoading) {
    return <LoadingScreen type="dashboard" />;
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeInUp}>
        <PageHeader
          title="Analytics Reports"
          description="Comprehensive financial analytics and insights"
        >
          <Button variant="outline" onClick={handleDownloadPDF} className="gap-2">
            <Download className="h-4 w-4" />
            Download Report
          </Button>
        </PageHeader>
      </motion.div>

      {/* Project Cost Analysis */}
      <ProjectCostAnalysis
        costs={costs}
        expenses={expenses}
        budgets={budgets}
        selectedProjectId={selectedProjectId}
        onProjectSelect={setSelectedProjectId}
      />

      {/* Key Metrics */}
      <motion.div
        variants={staggerContainer}
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {[
          { title: "Total Costs", value: formatCurrency(analytics.totalCosts, "USD"), icon: DollarSign, description: "One-time costs" },
          { title: "Total Expenses", value: formatCurrency(analytics.totalExpenses, "USD"), icon: TrendingUp, description: "Monthly projected" },
          { title: "Total Budgets", value: formatCurrency(analytics.totalBudgets, "USD"), icon: Target, description: "Budget allocation" },
          { title: "Budget Utilization", value: `${analytics.budgetUtilization.toFixed(1)}%`, icon: TrendingDown, description: "Cost vs Budget", variant: analytics.budgetUtilization > 100 ? "muted" : "default" },
        ].map((stat, index) => (
          <motion.div key={stat.title} variants={staggerItem}>
            <StatCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              description={stat.description}
              variant={stat.variant || "default"}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Budget vs Actual */}
      <Card>
        <CardHeader>
          <CardTitle>Budget vs Actual by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.budgetVsActual
              .filter((bva) => bva.budgeted > 0 || bva.actual > 0)
              .map((bva) => {
                const category = COST_CATEGORIES.find((c) => c.value === bva.category);
                const isOverBudget = bva.actual > bva.budgeted;
                return (
                  <div key={bva.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Text variant="body-sm" weight="medium">
                        {category?.label || bva.category}
                      </Text>
                      <div className="flex items-center gap-4">
                        <Text variant="caption" color="muted">
                          Budget: {formatCurrency(bva.budgeted, "USD")}
                        </Text>
                        <Text variant="caption" color="muted">
                          Actual: {formatCurrency(bva.actual, "USD")}
                        </Text>
                        <Badge
                          variant={isOverBudget ? "destructive" : "secondary"}
                        >
                          {isOverBudget ? "+" : ""}
                          {formatCurrency(Math.abs(bva.variance), "USD")}
                        </Badge>
                      </div>
                    </div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div
                        custom={Math.min(bva.percentage, 100)}
                        variants={progressBar}
                        initial="hidden"
                        animate="visible"
                        className={`h-full ${isOverBudget ? "bg-red-500" : "bg-primary"}`}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.categoryBreakdown
                .filter((cb) => cb.costs > 0 || cb.expenses > 0)
                .sort((a, b) => (b.costs + b.expenses) - (a.costs + a.expenses))
                .map((cb) => {
                  const category = COST_CATEGORIES.find((c) => c.value === cb.category);
                  return (
                    <div key={cb.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Text variant="body-sm" weight="medium">
                          {category?.label || cb.category}
                        </Text>
                        <Text variant="body-sm" weight="semibold">
                          {formatCurrency(cb.costs + cb.expenses, "USD")}
                        </Text>
                      </div>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>Costs: {formatCurrency(cb.costs, "USD")}</span>
                        <span>•</span>
                        <span>Expenses: {formatCurrency(cb.expenses, "USD")}</span>
                        <span>•</span>
                        <span>{cb.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                        <motion.div
                          custom={cb.percentage}
                          variants={progressBar}
                          initial="hidden"
                          animate="visible"
                          className="h-full bg-primary"
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Top Spending Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topCategories.map((tc, index) => {
                const category = COST_CATEGORIES.find((c) => c.value === tc.category);
                return (
                  <div
                    key={tc.category}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <Text variant="body-sm" weight="medium">
                          {category?.label || tc.category}
                        </Text>
                        <Text variant="caption" color="muted">
                          {tc.count} transactions
                        </Text>
                      </div>
                    </div>
                    <Text variant="body-sm" weight="bold">
                      {formatCurrency(tc.total, "USD")}
                    </Text>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Trend (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.monthlyTrend.map((mt) => {
              const maxValue = Math.max(
                ...analytics.monthlyTrend.map((m) => m.costs + m.expenses + m.budgets)
              );
              const total = mt.costs + mt.expenses;
              const percentage = maxValue > 0 ? (total / maxValue) * 100 : 0;
              return (
                <div key={mt.month} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Text variant="body-sm" weight="medium">
                      {mt.month}
                    </Text>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-muted-foreground">
                        Costs: {formatCurrency(mt.costs, "USD")}
                      </span>
                      <span className="text-muted-foreground">
                        Expenses: {formatCurrency(mt.expenses, "USD")}
                      </span>
                      <Text variant="body-sm" weight="semibold">
                        Total: {formatCurrency(total, "USD")}
                      </Text>
                    </div>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      custom={percentage}
                      variants={progressBar}
                      initial="hidden"
                      animate="visible"
                      className="h-full bg-primary"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
