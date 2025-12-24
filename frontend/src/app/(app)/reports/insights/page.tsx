"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layouts/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Download, Lightbulb, TrendingUp, AlertTriangle, Target } from "lucide-react";
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
import { toast } from "sonner";
import { LoadingScreen } from "@/components/atoms/loading-screen";

export default function InsightsReportsPage() {
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

  // Generate insights
  const insights = useMemo(() => {
    const insightsList: Array<{
      type: "warning" | "success" | "info";
      title: string;
      message: string;
      action?: string;
    }> = [];

    // Budget utilization insights
    if (analytics.budgetUtilization > 100) {
      insightsList.push({
        type: "warning",
        title: "Over Budget",
        message: `You've exceeded your total budget by ${(analytics.budgetUtilization - 100).toFixed(1)}%. Consider reviewing your spending.`,
        action: "Review Budgets",
      });
    } else if (analytics.budgetUtilization > 80) {
      insightsList.push({
        type: "warning",
        title: "Approaching Budget Limit",
        message: `You've used ${analytics.budgetUtilization.toFixed(1)}% of your budget. Monitor spending closely.`,
        action: "Monitor Spending",
      });
    } else if (analytics.budgetUtilization < 50) {
      insightsList.push({
        type: "success",
        title: "Well Within Budget",
        message: `You're using only ${analytics.budgetUtilization.toFixed(1)}% of your budget. Great financial discipline!`,
      });
    }

    // Category insights
    const overBudgetCategories = analytics.budgetVsActual.filter(
      (bva) => bva.actual > bva.budgeted && bva.budgeted > 0
    );
    if (overBudgetCategories.length > 0) {
      const topOverBudget = overBudgetCategories.sort((a, b) => b.variance - a.variance)[0];
      const category = COST_CATEGORIES.find((c) => c.value === topOverBudget.category);
      insightsList.push({
        type: "warning",
        title: "Category Over Budget",
        message: `${category?.label || topOverBudget.category} is over budget by ${formatCurrency(Math.abs(topOverBudget.variance), "USD")}.`,
        action: "Review Category",
      });
    }

    // Top spending category
    if (analytics.topCategories.length > 0) {
      const topCategory = analytics.topCategories[0];
      const category = COST_CATEGORIES.find((c) => c.value === topCategory.category);
      const percentage = (topCategory.total / (analytics.totalCosts + analytics.totalExpenses)) * 100;
      if (percentage > 30) {
        insightsList.push({
          type: "info",
          title: "High Spending Category",
          message: `${category?.label || topCategory.category} accounts for ${percentage.toFixed(1)}% of your total spending.`,
          action: "Analyze Category",
        });
      }
    }

    // Expense optimization
    const activeExpenses = filteredExpenses.filter((e) => e.isActive);
    if (activeExpenses.length > 10) {
      insightsList.push({
        type: "info",
        title: "Multiple Active Expenses",
        message: `You have ${activeExpenses.length} active recurring expenses. Consider reviewing subscriptions for potential savings.`,
        action: "Review Expenses",
      });
    }

    // Savings opportunity
    const lowSpendingCategories = analytics.categoryBreakdown
      .filter((cb) => cb.budgets > 0 && (cb.costs + cb.expenses) < cb.budgets * 0.5)
      .sort((a, b) => (b.budgets - (b.costs + b.expenses)) - (a.budgets - (a.costs + a.expenses)));
    
    if (lowSpendingCategories.length > 0) {
      const category = COST_CATEGORIES.find((c) => c.value === lowSpendingCategories[0].category);
      const potentialSavings = lowSpendingCategories[0].budgets - (lowSpendingCategories[0].costs + lowSpendingCategories[0].expenses);
      insightsList.push({
        type: "success",
        title: "Savings Opportunity",
        message: `${category?.label || lowSpendingCategories[0].category} is under budget. You could save up to ${formatCurrency(potentialSavings, "USD")}.`,
        action: "Optimize Budget",
      });
    }

    return insightsList;
  }, [analytics, filteredExpenses]);

  const handleDownloadPDF = async () => {
    try {
      const { downloadInsightsReportPDF } = await import("@/shared/utils/pdf");
      await downloadInsightsReportPDF(
        filteredCosts,
        filteredExpenses,
        filteredBudgets,
        analytics,
        insights,
        selectedProjectId ? `Insights Report - ${projects.find(p => p.uid === selectedProjectId)?.name || "Project"}` : "Insights Report"
      );
      toast.success("Insights report downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF report");
    }
  };

  if (isLoading) {
    return <LoadingScreen type="dashboard" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Insights Reports"
        description="AI-powered financial insights and recommendations"
      >
        <Button variant="outline" onClick={handleDownloadPDF} className="gap-2">
          <Download className="h-4 w-4" />
          Download Report
        </Button>
      </PageHeader>

      {/* Project Cost Analysis */}
      <ProjectCostAnalysis
        costs={costs}
        expenses={expenses}
        budgets={budgets}
        selectedProjectId={selectedProjectId}
        onProjectSelect={setSelectedProjectId}
      />

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Target className="h-5 w-5 text-blue-500" />
              </div>
              <Text variant="body-sm" weight="semibold">
                Budget Utilization
              </Text>
            </div>
            <Text variant="h4" weight="bold" className="mb-1">
              {analytics.budgetUtilization.toFixed(1)}%
            </Text>
            <Text variant="caption" color="muted">
              {analytics.budgetUtilization > 100 ? "Over budget" : "Within budget"}
            </Text>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <Text variant="body-sm" weight="semibold">
                Total Spending
              </Text>
            </div>
            <Text variant="h4" weight="bold" className="mb-1">
              {formatCurrency(analytics.totalCosts + analytics.totalExpenses, "USD")}
            </Text>
            <Text variant="caption" color="muted">
              Costs + Expenses
            </Text>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Lightbulb className="h-5 w-5 text-purple-500" />
              </div>
              <Text variant="body-sm" weight="semibold">
                Active Insights
              </Text>
            </div>
            <Text variant="h4" weight="bold" className="mb-1">
              {insights.length}
            </Text>
            <Text variant="caption" color="muted">
              Recommendations available
            </Text>
          </CardContent>
        </Card>
      </div>

      {/* Insights List */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.length === 0 ? (
              <div className="text-center py-8">
                <Text variant="body-sm" color="muted">
                  No insights available. Keep tracking your finances to get personalized recommendations.
                </Text>
              </div>
            ) : (
              insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    insight.type === "warning"
                      ? "border-red-500/20 bg-red-500/5"
                      : insight.type === "success"
                      ? "border-green-500/20 bg-green-500/5"
                      : "border-blue-500/20 bg-blue-500/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className={`p-2 rounded-lg ${
                          insight.type === "warning"
                            ? "bg-red-500/10"
                            : insight.type === "success"
                            ? "bg-green-500/10"
                            : "bg-blue-500/10"
                        }`}
                      >
                        {insight.type === "warning" ? (
                          <AlertTriangle
                            className={`h-5 w-5 ${
                              insight.type === "warning"
                                ? "text-red-500"
                                : "text-blue-500"
                            }`}
                          />
                        ) : insight.type === "success" ? (
                          <Target className="h-5 w-5 text-green-500" />
                        ) : (
                          <Lightbulb className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Text variant="body-sm" weight="semibold">
                            {insight.title}
                          </Text>
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
                        <Text variant="body-sm" color="muted">
                          {insight.message}
                        </Text>
                      </div>
                    </div>
                    {insight.action && (
                      <Button variant="outline" size="sm">
                        {insight.action}
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Categories Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Spending Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topCategories.map((tc, index) => {
              const category = COST_CATEGORIES.find((c) => c.value === tc.category);
              const percentage = (tc.total / (analytics.totalCosts + analytics.totalExpenses)) * 100;
              return (
                <div
                  key={tc.category}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <Text variant="body-sm" weight="semibold">
                        {category?.label || tc.category}
                      </Text>
                      <Text variant="caption" color="muted">
                        {tc.count} transactions • {percentage.toFixed(1)}% of total
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
  );
}
