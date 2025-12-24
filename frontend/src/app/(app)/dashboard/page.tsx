"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { WorkspaceOverview } from "@/components/organisms/workspace-overview";
import { ProjectStatistics } from "@/components/organisms/project-statistics";
import { TaskInsights } from "@/components/organisms/task-insights";
import { LoadingScreen } from "@/components/atoms/loading-screen";
import { NoteBoard } from "@/components/molecules/note-board";
import { BudgetCostCharts } from "@/components/organisms/budget-cost-charts";
import { QuickActions } from "@/components/molecules/quick-actions";
import { ProductivityIndexChart } from "@/components/molecules/productivity-index-chart";
import { BurnDownChart } from "@/components/molecules/burn-down-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { useDashboard } from "@/hooks/use-dashboard";
import { fadeInUp, staggerContainer, transitions } from "@/lib/motion";
import { Sparkles, RefreshCw, Calendar, Filter, Download, DollarSign } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useDashboard();
  const hasScrolledRef = useRef(false);

  // Ensure page scrolls to top on mount/navigation - run after all content loads
  useEffect(() => {
    // Disable scroll restoration
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    
    // Prevent any auto-scroll behavior
    const preventAutoScroll = (e: Event) => {
      if (hasScrolledRef.current) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    
    // Scroll to top after content is loaded
    const scrollToTop = () => {
      if (!hasScrolledRef.current && !isLoading && data) {
        // Use requestAnimationFrame to ensure DOM is fully rendered
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
          hasScrolledRef.current = true;
        });
      }
    };
    
    // Wait for data to load before scrolling
    if (!isLoading && data) {
      // Multiple attempts to ensure it works
      scrollToTop();
      setTimeout(scrollToTop, 0);
      setTimeout(scrollToTop, 50);
      setTimeout(scrollToTop, 200);
    }
    
    // Prevent focus from causing scroll
    window.addEventListener('scroll', preventAutoScroll, { passive: false, capture: true });
    
    return () => {
      window.removeEventListener('scroll', preventAutoScroll, { capture: true });
    };
  }, [isLoading, data]);

  const handleTaskClick = useCallback((taskId: string) => {
    // Navigate to task detail or open modal
    // TODO: Implement task navigation
  }, []);

  const handleQuickAction = useCallback((action: string) => {
    console.log("Quick action:", action);
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 max-w-[1920px] mx-auto">
        <LoadingScreen type="dashboard" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center min-h-[60vh] p-8"
      >
        <div className="text-center space-y-4 max-w-md">
          <div className="h-16 w-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold">Unable to load dashboard</h2>
          <p className="text-muted-foreground">
            There was an error loading your dashboard data. Please try refreshing the page.
          </p>
          <Button onClick={() => refetch()} variant="outline" className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="relative min-h-screen bg-background/50"
    >
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1920px] mx-auto min-h-screen">
        {/* Modern Header Section */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-6 w-1 bg-primary rounded-full" />
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Dashboard
              </h1>
            </div>
            <p className="text-muted-foreground ml-3">
              Overview of your workspace performance and financial metrics.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-card/50 p-1 rounded-xl border border-border/50 backdrop-blur-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              className="h-9 px-3 gap-2 hover:bg-muted transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <div className="w-px h-4 bg-border/50" />
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-3 gap-2 hover:bg-muted transition-all"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
            <div className="w-px h-4 bg-border/50" />
            <Button
              variant="primary"
              size="sm"
              className="h-9 px-4 gap-2 shadow-sm"
              onClick={async () => {
                try {
                  if (!data) return;
                  const { downloadDashboardPDF } = await import("@/shared/utils/pdf");
                  await downloadDashboardPDF(data, "Dashboard Report");
                  toast.success("Dashboard report downloaded successfully");
                } catch (error) {
                  console.error("Error generating PDF:", error);
                  toast.error("Failed to generate PDF report");
                }
              }}
            >
              <Download className="h-4 w-4" />
              <span>Export Report</span>
            </Button>
          </div>
        </motion.div>

        {/* Enterprise Grid System - Optimized spacing */}
        <div className="grid grid-cols-12 gap-4 lg:gap-6">
          {/* 1. TOP KPI ROW */}
          <motion.div
            variants={fadeInUp}
            transition={{ ...transitions.default, delay: 0.1 }}
            className="col-span-12"
          >
            <WorkspaceOverview data={data.workspaceOverview} />
          </motion.div>

          {/* 2. EXECUTION OVERVIEW */}
          <motion.div
            variants={fadeInUp}
            transition={{ ...transitions.default, delay: 0.2 }}
            className="col-span-12 lg:col-span-8"
          >
            <ProjectStatistics data={data.projectStatistics} dashboardData={data} />
          </motion.div>

          <motion.div
            variants={fadeInUp}
            transition={{ ...transitions.default, delay: 0.25 }}
            className="col-span-12 lg:col-span-4"
          >
            <TaskInsights
              data={data.taskInsights}
              onTaskClick={handleTaskClick}
            />
          </motion.div>

          {/* 3. PRODUCTIVITY & FINANCIALS */}
          {data.taskInsights && (
            <motion.div
              variants={fadeInUp}
              transition={{ ...transitions.default, delay: 0.35 }}
              className="col-span-12 lg:col-span-6"
            >
              <ProductivityIndexChart
                productivityIndex={data.taskInsights.productivityIndex}
                overdueTasks={data.taskInsights.overdueTasks.length}
                dueThisWeek={data.taskInsights.tasksDueThisWeek.length}
                recentlyCompleted={data.taskInsights.recentlyCompleted.length}
                totalTasks={
                  data.taskInsights.overdueTasks.length +
                  data.taskInsights.tasksDueThisWeek.length +
                  data.taskInsights.recentlyCompleted.length
                }
              />
            </motion.div>
          )}

          {data.budgetCostMetrics && (
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ ...transitions.default, delay: 0.4 }}
              className="col-span-12 lg:col-span-6"
            >
              <Card className="h-full border border-border/40 bg-card hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    Budget Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Budget</p>
                      <p className="text-2xl font-bold">
                        ${(data.budgetCostMetrics.totalBudget / 1000000).toFixed(2)}M
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Spent</p>
                      <p className="text-2xl font-bold text-destructive">
                        ${(data.budgetCostMetrics.totalSpent / 1000000).toFixed(2)}M
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Remaining</p>
                      <p className={cn(
                        "text-2xl font-bold",
                        data.budgetCostMetrics.remainingBudget >= 0 ? "text-success" : "text-destructive"
                      )}>
                        ${(Math.abs(data.budgetCostMetrics.remainingBudget) / 1000000).toFixed(2)}M
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-6 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground/80">Budget Utilization</span>
                      <Badge variant={data.budgetCostMetrics.budgetUtilization > 90 ? "destructive" : "secondary"} className="font-bold">
                        {data.budgetCostMetrics.budgetUtilization.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="h-3 w-full bg-muted rounded-full overflow-hidden shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, data.budgetCostMetrics.budgetUtilization)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={cn(
                          "h-full rounded-full shadow-sm",
                          data.budgetCostMetrics.budgetUtilization >= 90 ? "bg-destructive" : 
                          data.budgetCostMetrics.budgetUtilization >= 75 ? "bg-warning" : "bg-primary"
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* 4. FINANCIAL CHARTS */}
          {data.budgetCostMetrics && (
            <BudgetCostCharts data={data.budgetCostMetrics} />
          )}

          {/* 5. SPRINT & INSIGHTS */}
          <div className="col-span-12 lg:col-span-8">
            {data.projectStatistics.burnDownData.length > 0 && (
              <BurnDownChart data={data.projectStatistics.burnDownData} />
            )}
          </div>

          <div className="col-span-12 lg:col-span-4">
            <div className="grid grid-cols-1 gap-4 lg:gap-6 h-full">
              <QuickActions onActionClick={handleQuickAction} />
              <NoteBoard maxNotes={6} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
