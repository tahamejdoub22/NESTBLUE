"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { Progress } from "@/components/atoms/progress";
import { Button } from "@/components/atoms/button";
import {
  FolderKanban,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowRight,
  Target,
  Receipt,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatCurrency, toNumber } from "@/shared/utils/format";
import type { Cost, Expense, Budget, Currency } from "@/interfaces";
import { cn } from "@/lib/utils";
import { useProjects } from "@/hooks/use-projects";
import { fadeInUp, transitions } from "@/lib/motion";

interface ProjectCostAnalysisProps {
  costs: Cost[];
  expenses: Expense[];
  budgets: Budget[];
  selectedProjectId?: string;
  onProjectSelect?: (projectId: string | undefined) => void;
  className?: string;
}

export function ProjectCostAnalysis({
  costs,
  expenses,
  budgets,
  selectedProjectId,
  onProjectSelect,
  className,
}: ProjectCostAnalysisProps) {
  const router = useRouter();
  const { projects } = useProjects();

  // Create a map of project UIDs to project names
  const projectMap = useMemo(() => {
    const map = new Map<string, string>();
    projects.forEach((project) => {
      map.set(project.uid, project.name);
    });
    return map;
  }, [projects]);

  // Group costs, expenses, and budgets by project
  const projectAnalysis = useMemo(() => {
    const analysisMap = new Map<
      string,
      {
        id: string;
        name: string;
        costs: Cost[];
        expenses: Expense[];
        budgets: Budget[];
        totalCosts: number;
        totalExpenses: number;
        totalBudgets: number;
        currency: string;
      }
    >();

    // Add "All Projects" option
    analysisMap.set("all", {
      id: "all",
      name: "All Projects",
      costs: [],
      expenses: [],
      budgets: [],
      totalCosts: 0,
      totalExpenses: 0,
      totalBudgets: 0,
      currency: "USD",
    });

    // Process costs
    costs.forEach((cost) => {
      const projectId = cost.projectId || "unassigned";
      const projectName =
        projectId === "unassigned"
          ? "Unassigned"
          : projectMap.get(projectId) || `Project ${projectId}`;

      if (!analysisMap.has(projectId)) {
        analysisMap.set(projectId, {
          id: projectId,
          name: projectName,
          costs: [],
          expenses: [],
          budgets: [],
          totalCosts: 0,
          totalExpenses: 0,
          totalBudgets: 0,
          currency: cost.currency,
        });
      }
      const projectData = analysisMap.get(projectId)!;
      projectData.costs.push(cost);
      projectData.totalCosts += toNumber(cost.amount);
      analysisMap.get("all")!.costs.push(cost);
      analysisMap.get("all")!.totalCosts += toNumber(cost.amount);
    });

    // Process expenses
    expenses.forEach((expense) => {
      if (!expense.isActive) return;
      const projectId = expense.projectId || "unassigned";
      const projectName =
        projectId === "unassigned"
          ? "Unassigned"
          : projectMap.get(projectId) || `Project ${projectId}`;

      if (!analysisMap.has(projectId)) {
        analysisMap.set(projectId, {
          id: projectId,
          name: projectName,
          costs: [],
          expenses: [],
          budgets: [],
          totalCosts: 0,
          totalExpenses: 0,
          totalBudgets: 0,
          currency: expense.currency,
        });
      }
      const projectData = analysisMap.get(projectId)!;

      // Calculate monthly expense - only for active expenses
      let monthlyAmount = 0;
      switch (expense.frequency) {
        case "daily":
          monthlyAmount = toNumber(expense.amount) * 30;
          break;
        case "weekly":
          monthlyAmount = toNumber(expense.amount) * 4.33;
          break;
        case "monthly":
          monthlyAmount = toNumber(expense.amount);
          break;
        case "yearly":
          monthlyAmount = toNumber(expense.amount) / 12;
          break;
        case "one-time":
          monthlyAmount = 0;
          break;
        default:
          monthlyAmount = 0;
      }

      projectData.expenses.push(expense);
      projectData.totalExpenses += monthlyAmount;
      analysisMap.get("all")!.expenses.push(expense);
      analysisMap.get("all")!.totalExpenses += monthlyAmount;
    });

    // Process budgets
    budgets.forEach((budget) => {
      const projectId = budget.projectId || "unassigned";
      const projectName =
        projectId === "unassigned"
          ? "Unassigned"
          : projectMap.get(projectId) || `Project ${projectId}`;

      if (!analysisMap.has(projectId)) {
        analysisMap.set(projectId, {
          id: projectId,
          name: projectName,
          costs: [],
          expenses: [],
          budgets: [],
          totalCosts: 0,
          totalExpenses: 0,
          totalBudgets: 0,
          currency: budget.currency,
        });
      }
      const projectData = analysisMap.get(projectId)!;
      projectData.budgets.push(budget);
      projectData.totalBudgets += toNumber(budget.amount);
      analysisMap.get("all")!.budgets.push(budget);
      analysisMap.get("all")!.totalBudgets += toNumber(budget.amount);
    });

    return Array.from(analysisMap.values())
      .filter((p) => {
        if (p.id === "all") return true;
        return p.costs.length > 0 || p.expenses.length > 0 || p.budgets.length > 0;
      })
      .filter((p) => {
        if (p.id === "unassigned") {
          return p.costs.length > 0 || p.expenses.length > 0 || p.budgets.length > 0;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.id === "all") return -1;
        if (b.id === "all") return 1;
        if (a.id === "unassigned") return 1;
        if (b.id === "unassigned") return -1;
        return b.totalCosts + b.totalExpenses - (a.totalCosts + a.totalExpenses);
      });
  }, [costs, expenses, budgets, projectMap]);

  const selectedProject = useMemo(() => {
    if (!selectedProjectId || selectedProjectId === "all") {
      return projectAnalysis.find((p) => p.id === "all");
    }
    return projectAnalysis.find((p) => p.id === selectedProjectId);
  }, [projectAnalysis, selectedProjectId]);

  const handleProjectClick = (projectId: string) => {
    if (onProjectSelect) {
      onProjectSelect(projectId === "all" ? undefined : projectId);
    } else {
      if (projectId !== "all" && projectId !== "unassigned") {
        router.push(`/projects/${projectId}`);
      }
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Project Filter Card */}
      <motion.div
        variants={fadeInUp}
        transition={{ ...transitions.default, delay: 0.1 }}
      >
        <Card className="border border-border/40 bg-card hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-3 px-4 pt-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-primary" />
              Filter by Project
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Select a project to view its financial breakdown
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4">
            {/* Project Selector */}
            <div className="flex flex-wrap gap-2">
              {projectAnalysis.map((project) => {
                const isSelected =
                  selectedProjectId === project.id ||
                  (!selectedProjectId && project.id === "all");
                const itemCount =
                  project.costs.length + project.expenses.length + project.budgets.length;

                return (
                  <Button
                    key={project.id}
                    variant={isSelected ? "primary" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (onProjectSelect) {
                        if (project.id === "all") {
                          onProjectSelect(undefined);
                        } else {
                          onProjectSelect(project.id);
                        }
                      }
                    }}
                    className={cn(
                      "h-8 px-3 gap-2 transition-all duration-200",
                      isSelected && "bg-primary text-primary-foreground"
                    )}
                  >
                    <FolderKanban className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">{project.name}</span>
                    {itemCount > 0 && (
                      <Badge
                        variant={isSelected ? "secondary" : "outline"}
                        className="h-4 px-1.5 text-xs font-semibold"
                      >
                        {itemCount}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>

            {/* Selected Project Summary */}
            {selectedProject && (
              <div className="mt-4 pt-4 border-t border-border/40 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                    <div className="flex items-center gap-2 mb-1.5">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">Total Costs</span>
                    </div>
                    <p className="text-xl font-bold text-foreground">
                      {formatCurrency(selectedProject.totalCosts, selectedProject.currency as Currency)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedProject.costs.length} cost{selectedProject.costs.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30">
                    <div className="flex items-center gap-2 mb-1.5">
                      <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-medium text-muted-foreground">Monthly Expenses</span>
                    </div>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(selectedProject.totalExpenses, selectedProject.currency as Currency)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedProject.expenses.length} active expense
                      {selectedProject.expenses.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-medium text-muted-foreground">Total Budget</span>
                    </div>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(selectedProject.totalBudgets, selectedProject.currency as Currency)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedProject.budgets.length} budget{selectedProject.budgets.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Budget Utilization */}
                {selectedProject.totalBudgets > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Budget Utilization</span>
                      <span
                        className={cn(
                          "font-semibold",
                          (selectedProject.totalCosts / selectedProject.totalBudgets) * 100 >= 90
                            ? "text-red-600 dark:text-red-400"
                            : (selectedProject.totalCosts / selectedProject.totalBudgets) * 100 >= 70
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-emerald-600 dark:text-emerald-400"
                        )}
                      >
                        {((selectedProject.totalCosts / selectedProject.totalBudgets) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={Math.min(
                        (selectedProject.totalCosts / selectedProject.totalBudgets) * 100,
                        100
                      )}
                      className={cn(
                        "h-2",
                        (selectedProject.totalCosts / selectedProject.totalBudgets) * 100 >= 90 &&
                          "[&>div]:bg-red-500",
                        (selectedProject.totalCosts / selectedProject.totalBudgets) * 100 >= 70 &&
                          (selectedProject.totalCosts / selectedProject.totalBudgets) * 100 < 90 &&
                          "[&>div]:bg-amber-500",
                        (selectedProject.totalCosts / selectedProject.totalBudgets) * 100 < 70 &&
                          "[&>div]:bg-emerald-500"
                      )}
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Spent: {formatCurrency(selectedProject.totalCosts, selectedProject.currency as Currency)}
                      </span>
                      <span>
                        Remaining:{" "}
                        {formatCurrency(
                          selectedProject.totalBudgets - selectedProject.totalCosts,
                          selectedProject.currency as Currency
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {/* View Project Button */}
                {selectedProject.id !== "all" && selectedProject.id !== "unassigned" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 gap-2"
                    onClick={() => handleProjectClick(selectedProject.id)}
                  >
                    View Project Details
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Projects Overview List */}
      {projectAnalysis.filter((p) => p.id !== "all").length > 0 && (
        <motion.div
          variants={fadeInUp}
          transition={{ ...transitions.default, delay: 0.2 }}
        >
          <Card className="border border-border/40 bg-card hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3 px-4 pt-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-primary" />
                Projects Overview
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                Quick overview of all projects with financial data
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-4">
              <div className="space-y-2">
                {projectAnalysis
                  .filter((p) => p.id !== "all")
                  .map((project) => {
                    const totalSpending = project.totalCosts + project.totalExpenses;
                    const budgetUtilization =
                      project.totalBudgets > 0
                        ? (project.totalCosts / project.totalBudgets) * 100
                        : 0;
                    const isOverBudget = budgetUtilization > 100;

                    return (
                      <div
                        key={project.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border border-border/40 bg-card hover:bg-muted/30 transition-all duration-200 cursor-pointer group",
                          selectedProjectId === project.id && "bg-primary/5 border-primary/30"
                        )}
                        onClick={() => handleProjectClick(project.id)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                            <FolderKanban className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-foreground truncate">
                              {project.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {project.costs.length}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Receipt className="h-3 w-3" />
                                {project.expenses.length}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                {project.budgets.length}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 ml-4">
                          <div className="text-right">
                            <p className="text-sm font-bold text-foreground">
                              {formatCurrency(totalSpending, project.currency as Currency)}
                            </p>
                            <p className="text-xs text-muted-foreground">Total Spending</p>
                          </div>
                          {project.totalBudgets > 0 && (
                            <div className="text-right">
                              <p
                                className={cn(
                                  "text-sm font-bold",
                                  isOverBudget
                                    ? "text-red-600 dark:text-red-400"
                                    : budgetUtilization >= 70
                                      ? "text-amber-600 dark:text-amber-400"
                                      : "text-emerald-600 dark:text-emerald-400"
                                )}
                              >
                                {budgetUtilization.toFixed(0)}%
                              </p>
                              <p className="text-xs text-muted-foreground">Budget Used</p>
                            </div>
                          )}
                          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 group-hover:text-foreground transition-colors" />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
