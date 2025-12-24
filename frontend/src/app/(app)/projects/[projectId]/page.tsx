"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Tabs } from "@/components/molecules/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { InviteTeamModal } from "@/components/molecules/invite-team-modal";
import { CreateSpaceModal } from "@/components/molecules/create-space-modal";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import { Progress } from "@/components/atoms/progress";
import { cn } from "@/lib/utils";
import {
  FolderKanban,
  Receipt,
  FileText,
  Download,
  Calendar,
  Target,
  UserPlus,
  Users,
  Hash,
  TrendingUp,
  AlertCircle,
  DollarSign,
  TrendingDown,
  BarChart3,
  LineChart as LineChartIcon,
} from "lucide-react";
import { format } from "date-fns";
import { fadeInUp, transitions } from "@/lib/motion";
import {
  calculateProjectFinancialSummary,
  calculateProjectCostBreakdown,
  calculateProjectExpenseAnalysis,
  getProjectTaskEstimates,
} from "@/core/services/project-analytics";
import { useProject } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
import { useCosts } from "@/hooks/use-costs";
import { useExpenses } from "@/hooks/use-expenses";
import { useBudgets } from "@/hooks/use-budgets";
import { useProjectMembers } from "@/hooks/use-project-members";
import { useAllSpaces } from "@/hooks/use-all-spaces";
import { useSprints } from "@/hooks/use-sprints";
import { SprintCard } from "@/components/molecules/sprints/sprint-card";
import { SprintFormModal } from "@/components/molecules/sprints/sprint-form-modal";
import { Text } from "@/components/atoms/text";
import { Plus } from "lucide-react";
import type { Sprint } from "@/interfaces";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { teamSpacesApi } from "@/core/services/api-helpers";
import { LoadingScreen } from "@/components/atoms/loading-screen";
import { useRouter } from "next/navigation";
import { downloadProjectReportPDF } from "@/shared/utils/pdf";
import { toast } from "sonner";
import type {
  ProjectCost,
  ProjectExpense,
  ProjectBudget,
} from "@/interfaces/project.interface";
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
  AreaChart,
  Area,
  Line,
} from "recharts";


export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string;
  const [activeTab, setActiveTab] = useState("overview");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCreateSpaceModalOpen, setIsCreateSpaceModalOpen] = useState(false);

  // Fetch project from backend
  const { project, isLoading: isLoadingProject } = useProject(projectId || "");
  
  // Fetch tasks for analytics only (not displayed in UI)
  const { tasks = [] } = useTasks(projectId);
  
  // Fetch sprints for this project
  const { sprints = [], isLoading: isLoadingSprints, createSprint, updateSprint, deleteSprint, isCreating, isUpdating, isDeleting } = useSprints(projectId);
  
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);

  // Fetch team members and spaces
  const { members, inviteMembers, isInviting } = useProjectMembers(projectId || "");
  const queryClient = useQueryClient();
  const { spaces, isLoading: spacesLoading } = useAllSpaces();
  
  const createSpaceMutation = useMutation({
    mutationFn: (input: { name: string; description?: string }) =>
      teamSpacesApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-spaces"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
  
  const createSpace = createSpaceMutation.mutateAsync;
  
  // Fetch all costs, expenses, and budgets from backend
  const { costs: allCosts } = useCosts();
  const { expenses: allExpenses } = useExpenses();
  const { budgets: allBudgets } = useBudgets();

  // Filter costs, expenses, and budgets by projectId
  const costs = useMemo(() => {
    if (!projectId) return [];
    return allCosts
      .filter((cost) => cost.projectId === projectId)
      .map((cost) => ({
        id: cost.id,
        name: cost.name,
        amount: cost.amount,
        currency: cost.currency,
        category: cost.category,
        date: new Date(cost.date),
        projectId: cost.projectId || projectId,
        createdAt: new Date(cost.createdAt),
        updatedAt: new Date(cost.updatedAt),
      })) as ProjectCost[];
  }, [allCosts, projectId]);

  const expenses = useMemo(() => {
    if (!projectId) return [];
    return allExpenses
      .filter((expense) => expense.projectId === projectId)
      .map((expense) => ({
        id: expense.id,
        name: expense.name,
        amount: expense.amount,
        currency: expense.currency,
        category: expense.category,
        frequency: expense.frequency,
        startDate: new Date(expense.startDate),
        isActive: expense.isActive,
        projectId: expense.projectId || projectId,
        createdAt: new Date(expense.createdAt),
        updatedAt: new Date(expense.updatedAt),
      })) as ProjectExpense[];
  }, [allExpenses, projectId]);

  const budgets = useMemo(() => {
    if (!projectId) return [];
    return allBudgets
      .filter((budget) => budget.projectId === projectId)
      .map((budget) => ({
        id: budget.id,
        name: budget.name,
        amount: budget.amount,
        currency: budget.currency,
        category: budget.category,
        period: budget.period,
        startDate: new Date(budget.startDate),
        endDate: budget.endDate ? new Date(budget.endDate) : undefined,
        projectId: budget.projectId || projectId,
        createdAt: new Date(budget.createdAt),
        updatedAt: new Date(budget.updatedAt),
      })) as ProjectBudget[];
  }, [allBudgets, projectId]);

  // Calculate analytics
  const financialSummary = useMemo(
    () => calculateProjectFinancialSummary(costs, expenses, budgets, tasks, "USD"),
    [costs, expenses, budgets, tasks]
  );

  const costBreakdown = useMemo(
    () => calculateProjectCostBreakdown(costs, budgets, tasks, "USD"),
    [costs, budgets, tasks]
  );

  const expenseAnalysis = useMemo(
    () => calculateProjectExpenseAnalysis(expenses, "USD"),
    [expenses]
  );

  const taskEstimates = useMemo(
    () => getProjectTaskEstimates(tasks, "USD"),
    [tasks]
  );

  // Show loading state
  if (isLoadingProject) {
    return <LoadingScreen type="project-detail" />;
  }

  // Show error state
  if (!project && !isLoadingProject) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="h-16 w-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold">Project not found</h2>
          <p className="text-muted-foreground">
            The project you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => router.push("/projects")} variant="outline" className="mt-4">
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const tabs = [
    { value: "overview", label: "Overview", icon: <FolderKanban className="h-4 w-4" /> },
    { value: "sprints", label: "Sprints", icon: <Target className="h-4 w-4" /> },
    { value: "reports", label: "Reports", icon: <BarChart3 className="h-4 w-4" /> },
    { value: "team", label: "Team", icon: <Users className="h-4 w-4" /> },
  ];
  
  
  const handleCreateSprint = () => {
    setEditingSprint(null);
    setIsSprintModalOpen(true);
  };
  
  const handleEditSprint = (sprint: Sprint) => {
    setEditingSprint(sprint);
    setIsSprintModalOpen(true);
  };
  
  const handleSprintSubmit = async (data: Partial<Sprint>) => {
    try {
      if (editingSprint) {
        await updateSprint({ id: editingSprint.id, data });
      } else {
        await createSprint({ ...data, projectId: projectId });
      }
      setIsSprintModalOpen(false);
      setEditingSprint(null);
    } catch (error: any) {
      console.error("Failed to save sprint:", error);
    }
  };

  const existingMemberIds = useMemo(() => {
    return members.map((m: any) => m.userId || m.user?.id).filter(Boolean);
  }, [members]);

  return (
    <div className="space-y-6 bg-[#F7F9FC] dark:bg-background min-h-screen p-6">
      <div className="max-w-[1920px] mx-auto space-y-6">
        {/* Enterprise Project Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6"
        >
          <div className="flex-1 space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 flex-shrink-0">
                <FolderKanban className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    {project.name}
                  </h1>
                  <Badge
                    variant="outline"
                    className={cn(
                      "capitalize text-xs",
                      project.status === "active"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : project.status === "on-hold"
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                          : "bg-muted text-muted-foreground border-border"
                    )}
                  >
                    {project.status || "active"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {project.description || "No description provided"}
                </p>
                {project.startDate && project.endDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(project.startDate), "MMM d, yyyy")} - {format(new Date(project.endDate), "MMM d, yyyy")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsInviteModalOpen(true)}
              className="h-9 px-4 gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Invite Team
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 px-4 gap-2"
              onClick={async () => {
                try {
                  if (!project) return;
                  await downloadProjectReportPDF(
                    project,
                    allCosts,
                    allExpenses,
                    allBudgets,
                    tasks,
                    sprints
                  );
                  toast.success("Project report downloaded successfully");
                } catch (error) {
                  console.error("Error generating PDF:", error);
                  toast.error("Failed to generate PDF report");
                }
              }}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Key Metrics Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2"
        >
          <Card className="border border-border/40 bg-card hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Progress</p>
                  <p className="text-2xl font-bold text-foreground">{project.progress || 0}%</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary" />
                </div>
              </div>
              <Progress value={project.progress || 0} className="h-1.5 mt-3" />
            </CardContent>
          </Card>

          <Card className="border border-border/40 bg-card hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Total Budget</p>
                  <p className="text-2xl font-bold text-foreground">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(financialSummary.totalBudget)}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/40 bg-card hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Tasks</p>
                  <p className="text-2xl font-bold text-foreground">{tasks.length}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/40 bg-card hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Team Members</p>
                  <p className="text-2xl font-bold text-foreground">{members.length}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} items={tabs} />
        </motion.div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="grid grid-cols-12 gap-2"
          >
            {/* Budget Overview Card */}
            <motion.div
              variants={fadeInUp}
              transition={{ ...transitions.default, delay: 0.4 }}
              className="col-span-12 lg:col-span-6"
            >
              <Card className="h-full border border-border/40 bg-card hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3 px-4 pt-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Budget Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-4 pb-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-3 rounded-lg bg-muted/30 border border-border/40">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Total Budget</p>
                      <p className="text-lg font-bold text-foreground">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(financialSummary.totalBudget)}
                      </p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Spent</p>
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(financialSummary.totalSpent)}
                      </p>
                    </div>
                    <div className={cn(
                      "text-center p-3 rounded-lg border",
                      financialSummary.remaining >= 0 
                        ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30" 
                        : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30"
                    )}>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Remaining</p>
                      <p className={cn(
                        "text-lg font-bold",
                        financialSummary.remaining >= 0 
                          ? "text-emerald-600 dark:text-emerald-400" 
                          : "text-red-600 dark:text-red-400"
                      )}>
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(financialSummary.remaining)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/40">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Utilization</span>
                      <span className={cn(
                        "text-sm font-semibold",
                        financialSummary.budgetUtilization >= 90
                          ? "text-red-600 dark:text-red-400"
                          : financialSummary.budgetUtilization >= 70
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-emerald-600 dark:text-emerald-400"
                      )}>
                        {financialSummary.budgetUtilization.toFixed(1)}%
                      </span>
                    </div>
                    <div className="relative w-full h-2 bg-muted/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, financialSummary.budgetUtilization)}%` }}
                        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                        className={cn(
                          "h-full rounded-full transition-colors",
                          financialSummary.budgetUtilization >= 90
                            ? "bg-red-500"
                            : financialSummary.budgetUtilization >= 70
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Task Statistics Card */}
            <motion.div
              variants={fadeInUp}
              transition={{ ...transitions.default, delay: 0.45 }}
              className="col-span-12 lg:col-span-6"
            >
              <Card className="h-full border border-border/40 bg-card hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3 px-4 pt-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Task Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-4 pb-4">
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Total Tasks</p>
                      <p className="text-xl font-bold text-foreground">{tasks.length}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Completed</p>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {tasks.filter(t => t.status === "complete").length}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30">
                      <p className="text-xs font-medium text-muted-foreground mb-1">In Progress</p>
                      <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                        {tasks.filter(t => t.status === "in-progress").length}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                      <p className="text-xs font-medium text-muted-foreground mb-1">With Estimates</p>
                      <p className="text-xl font-bold text-foreground">{taskEstimates.length}</p>
                    </div>
                  </div>
                  {tasks.length > 0 && (
                    <div className="pt-3 border-t border-border/40">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold text-foreground">
                          {Math.round((tasks.filter(t => t.status === "complete").length / tasks.length) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={(tasks.filter(t => t.status === "complete").length / tasks.length) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Budget Breakdown Chart */}
            {costBreakdown.length > 0 && (
              <motion.div
                variants={fadeInUp}
                transition={{ ...transitions.default, delay: 0.5 }}
                className="col-span-12 lg:col-span-4"
              >
                <Card className="h-full border border-border/40 bg-card hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-3 px-4 pt-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Budget Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 px-4 pb-4">
                    <div className="w-full min-w-0" style={{ height: '192px', minHeight: '192px' }}>
                      <ResponsiveContainer width="100%" height={192} minWidth={0} minHeight={192}>
                        <BarChart data={costBreakdown.slice(0, 5)} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                              const numeric = Number(
                                Array.isArray(value) ? value[0] : value
                              );
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
                            {costBreakdown.slice(0, 5).map((entry, index) => (
                              <Cell
                                key={`budget-${index}`}
                                fill="hsl(var(--primary) / 0.15)"
                              />
                            ))}
                          </Bar>
                          <Bar dataKey="spent" stackId="a" radius={[4, 4, 0, 0]}>
                            {costBreakdown.slice(0, 5).map((entry, index) => (
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

            {/* Expense Distribution Chart */}
            {expenseAnalysis.byCategory.length > 0 && (
              <motion.div
                variants={fadeInUp}
                transition={{ ...transitions.default, delay: 0.55 }}
                className="col-span-12 lg:col-span-4"
              >
                <Card className="h-full border border-border/40 bg-card hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-3 px-4 pt-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-primary" />
                      Expense Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 px-4 pb-4">
                    <div className="w-full min-w-0" style={{ height: '192px', minHeight: '192px' }}>
                      <ResponsiveContainer width="100%" height={192} minWidth={0} minHeight={192}>
                        <PieChart>
                          <Pie
                            data={expenseAnalysis.byCategory.slice(0, 5)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }: any) =>
                              name && percent ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                            }
                            outerRadius={50}
                            fill="#8884d8"
                            dataKey="amount"
                            stroke="hsl(var(--card))"
                            strokeWidth={2}
                          >
                            {expenseAnalysis.byCategory.slice(0, 5).map((entry, index) => {
                              const colors = [
                                "hsl(var(--primary))",
                                "hsl(var(--primary) / 0.8)",
                                "hsl(var(--primary) / 0.6)",
                                "hsl(var(--primary) / 0.4)",
                                "hsl(var(--primary) / 0.2)",
                              ];
                              return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                            })}
                          </Pie>
                          <Tooltip
                            formatter={(value: number | undefined) => value ? `$${value.toLocaleString()}` : ''}
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                              padding: "8px",
                            }}
                          />
                          <Legend 
                            wrapperStyle={{ fontSize: '12px', marginTop: '4px' }}
                            iconType="circle"
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Cost Trend Chart */}
            {expenseAnalysis.trends && expenseAnalysis.trends.length > 0 && (
              <motion.div
                variants={fadeInUp}
                transition={{ ...transitions.default, delay: 0.6 }}
                className="col-span-12 lg:col-span-4"
              >
                <Card className="h-full border border-border/40 bg-card hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-3 px-4 pt-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <LineChartIcon className="h-4 w-4 text-primary" />
                      Cost Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 px-4 pb-4">
                    <div className="w-full min-w-0" style={{ height: '192px', minHeight: '192px' }}>
                      <ResponsiveContainer width="100%" height={192} minWidth={0} minHeight={192}>
                        <AreaChart
                          data={expenseAnalysis.trends}
                          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
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
                            dataKey="amount"
                            stroke="hsl(var(--primary))"
                            fill="url(#costGradient)"
                            strokeWidth={2.5}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        )}

        {activeTab === "reports" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="grid grid-cols-12 gap-2"
          >
            {/* Top row: Financial KPIs for this project */}
            <motion.div
              variants={fadeInUp}
              transition={{ ...transitions.default, delay: 0.25 }}
              className="col-span-12 lg:col-span-3"
            >
              <Card className="h-full border border-border/40 bg-card hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3 px-4 pt-4">
                  <CardTitle className="text-base font-semibold">Total Budget</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-4 pb-4">
                  <p className="text-2xl font-bold text-foreground mb-1">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(financialSummary.totalBudget)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Sum of all active budgets for this project.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              transition={{ ...transitions.default, delay: 0.3 }}
              className="col-span-12 lg:col-span-3"
            >
              <Card className="h-full border border-border/40 bg-card hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3 px-4 pt-4">
                  <CardTitle className="text-base font-semibold">Total Spent</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-4 pb-4">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(financialSummary.totalSpent)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    All recorded costs allocated to this project.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              transition={{ ...transitions.default, delay: 0.35 }}
              className="col-span-12 lg:col-span-3"
            >
              <Card className="h-full border border-border/40 bg-card hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3 px-4 pt-4">
                  <CardTitle className="text-base font-semibold">Remaining Budget</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-4 pb-4">
                  <p
                    className={cn(
                      "text-2xl font-bold mb-1",
                      financialSummary.remaining >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    )}
                  >
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(financialSummary.remaining)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Budget left after current spending.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              transition={{ ...transitions.default, delay: 0.4 }}
              className="col-span-12 lg:col-span-3"
            >
              <Card className="h-full border border-border/40 bg-card hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3 px-4 pt-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-primary" />
                    Monthly Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-4 pb-4">
                  <p className="text-2xl font-bold text-primary mb-1">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(expenseAnalysis.monthlyExpenses)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Active recurring expenses normalized to monthly.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Middle row: Budget breakdown + expense distribution + cost trend */}
            {costBreakdown.length > 0 && (
              <motion.div
                variants={fadeInUp}
                transition={{ ...transitions.default, delay: 0.45 }}
                className="col-span-12 lg:col-span-4"
              >
                <Card className="h-full border border-border/40 bg-card hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-3 px-4 pt-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Budget vs Spent by Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 px-4 pb-4">
                    <div className="w-full min-w-0" style={{ height: '192px', minHeight: '192px' }}>
                      <ResponsiveContainer width="100%" height={192} minWidth={0} minHeight={192}>
                        <BarChart
                          data={costBreakdown.slice(0, 6)}
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
                              const numeric = Number(
                                Array.isArray(value) ? value[0] : value
                              );
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
                            {costBreakdown.slice(0, 6).map((entry, index) => (
                              <Cell
                                key={`reports-budget-${index}`}
                                fill="hsl(var(--primary) / 0.15)"
                              />
                            ))}
                          </Bar>
                          <Bar dataKey="spent" stackId="a" radius={[4, 4, 0, 0]}>
                            {costBreakdown.slice(0, 6).map((entry, index) => (
                              <Cell
                                key={`reports-spent-${index}`}
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

            {expenseAnalysis.byCategory.length > 0 && (
              <motion.div
                variants={fadeInUp}
                transition={{ ...transitions.default, delay: 0.5 }}
                className="col-span-12 lg:col-span-4"
              >
                <Card className="h-full border border-border/40 bg-card hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-3 px-4 pt-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-primary" />
                      Expense Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 px-4 pb-4">
                    <div className="w-full min-w-0" style={{ height: '192px', minHeight: '192px' }}>
                      <ResponsiveContainer width="100%" height={192} minWidth={0} minHeight={192}>
                        <PieChart>
                          <Pie
                            data={expenseAnalysis.byCategory.slice(0, 6)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }: any) =>
                              name && percent ? `${name}: ${(percent * 100).toFixed(0)}%` : ""
                            }
                            outerRadius={50}
                            fill="#8884d8"
                            dataKey="amount"
                            stroke="hsl(var(--card))"
                            strokeWidth={2}
                          >
                            {expenseAnalysis.byCategory.slice(0, 6).map((entry, index) => {
                              const colors = [
                                "hsl(var(--primary))",
                                "hsl(var(--primary) / 0.8)",
                                "hsl(var(--primary) / 0.6)",
                                "hsl(var(--primary) / 0.4)",
                                "hsl(var(--primary) / 0.2)",
                                "hsl(var(--primary) / 0.15)",
                              ];
                              return (
                                <Cell
                                  key={`reports-expense-${index}`}
                                  fill={colors[index % colors.length]}
                                />
                              );
                            })}
                          </Pie>
                          <Tooltip
                            formatter={(value: any) => {
                              const numeric = Number(
                                Array.isArray(value) ? value[0] : value
                              );
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
                          <Legend
                            wrapperStyle={{ fontSize: "12px", marginTop: "4px" }}
                            iconType="circle"
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {expenseAnalysis.trends && expenseAnalysis.trends.length > 0 && (
              <motion.div
                variants={fadeInUp}
                transition={{ ...transitions.default, delay: 0.55 }}
                className="col-span-12 lg:col-span-4"
              >
                <Card className="h-full border border-border/40 bg-card hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-3 px-4 pt-4">
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <LineChartIcon className="h-4 w-4 text-primary" />
                      Expense Trend (6 months)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 px-4 pb-4">
                    <div className="w-full min-w-0" style={{ height: '192px', minHeight: '192px' }}>
                      <ResponsiveContainer width="100%" height={192} minWidth={0} minHeight={192}>
                        <AreaChart
                          data={expenseAnalysis.trends}
                          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="reportsCostGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop
                                offset="5%"
                                stopColor="hsl(var(--primary))"
                                stopOpacity={0.4}
                              />
                              <stop
                                offset="95%"
                                stopColor="hsl(var(--primary))"
                                stopOpacity={0}
                              />
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
                            dataKey="amount"
                            stroke="hsl(var(--primary))"
                            fill="url(#reportsCostGradient)"
                            strokeWidth={2.5}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Bottom row: Task cost insight / variance */}
            <motion.div
              variants={fadeInUp}
              transition={{ ...transitions.default, delay: 0.6 }}
              className="col-span-12 lg:col-span-6"
            >
              <Card className="h-full border border-border/40 bg-card hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3 px-4 pt-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Task Cost Insights
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    How task estimates compare with actual spending.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 px-4 pb-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Estimated from Tasks
                      </p>
                      <p className="text-lg font-bold text-foreground">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(financialSummary.totalEstimated)}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "p-3 rounded-lg border",
                        financialSummary.variance < 0
                          ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30"
                          : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30"
                      )}
                    >
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Budget Variance
                      </p>
                      <p
                        className={cn(
                          "text-lg font-bold",
                          financialSummary.variance < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        )}
                      >
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(financialSummary.variance)}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border/40 text-xs text-muted-foreground">
                    {taskEstimates.length > 0
                      ? `${taskEstimates.length} tasks have cost estimates. Use this to anticipate future spending.`
                      : "No tasks with cost estimates yet. Add estimates to improve forecasting."}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              transition={{ ...transitions.default, delay: 0.65 }}
              className="col-span-12 lg:col-span-6"
            >
              <Card className="h-full border border-border/40 bg-card hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3 px-4 pt-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Health & Risk Summary
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    Quick insight into budget pressure and expense intensity.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 px-4 pb-4 space-y-3">
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Budget Utilization</span>
                      <span
                        className={cn(
                          "font-semibold",
                          financialSummary.budgetUtilization >= 90
                            ? "text-red-600 dark:text-red-400"
                            : financialSummary.budgetUtilization >= 70
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-emerald-600 dark:text-emerald-400"
                        )}
                      >
                        {financialSummary.budgetUtilization.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Monthly Expense Load</span>
                      <span className="font-semibold">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(expenseAnalysis.monthlyExpenses)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Active Expense Streams</span>
                      <span className="font-semibold">
                        {expenseAnalysis.byFrequency.reduce((sum, f) => sum + f.count, 0)}
                      </span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-border/40 text-xs text-muted-foreground">
                    {financialSummary.budgetUtilization >= 90
                      ? "This project is over 90% of its budget. Consider reducing costs or increasing budget."
                      : financialSummary.budgetUtilization >= 70
                        ? "Budget is getting tight. Monitor expenses closely and review upcoming costs."
                        : "Budget utilization is healthy. You have room to invest in key tasks and resources."}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {activeTab === "sprints" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <Text variant="h3" className="font-semibold mb-2">
                  Sprints
                </Text>
                <Text variant="body-sm" className="text-muted-foreground">
                  Organize and track your project tasks by sprint
                </Text>
              </div>
              <Button onClick={handleCreateSprint} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Sprint
              </Button>
            </div>
            
            {isLoadingSprints ? (
              <LoadingScreen />
            ) : sprints.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <Text variant="h3" className="mb-2">No sprints yet</Text>
                  <Text variant="body-sm" className="text-muted-foreground mb-4">
                    Create your first sprint to organize and track your project tasks.
                  </Text>
                  <Button onClick={handleCreateSprint} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Sprint
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sprints.map((sprint) => (
                  <SprintCard
                    key={sprint.id}
                    sprint={sprint}
                    onEdit={handleEditSprint}
                    onDelete={(sprint) => deleteSprint(sprint.id)}
                    isDeleting={isDeleting}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}


        {activeTab === "team" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            <Card className="border border-border/40 bg-card hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3 px-4 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">Team Members</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      Manage project team members and their roles
                    </CardDescription>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => setIsInviteModalOpen(true)}
                    className="h-9 px-4 gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Invite Members
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0 px-4 pb-4">
                {members.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium mb-1">No team members yet</p>
                    <p className="text-xs">Invite members to get started</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {members.map((member: any) => {
                      const user = member.user || {};
                      return (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 border border-border/40 rounded-lg hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-semibold text-primary">
                                {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-sm truncate">{user.name || "Unknown"}</div>
                              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className="capitalize text-xs flex-shrink-0"
                          >
                            {member.role || "member"}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-border/40 bg-card hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-3 px-4 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">Team Spaces</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      Create dedicated spaces for team collaboration
                    </CardDescription>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => setIsCreateSpaceModalOpen(true)}
                    className="h-9 px-4 gap-2"
                  >
                    <Hash className="h-4 w-4" />
                    Create Space
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0 px-4 pb-4">
                {spacesLoading ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="animate-pulse">Loading spaces...</div>
                  </div>
                ) : spaces.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Hash className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium mb-1">No spaces yet</p>
                    <p className="text-xs">Create a space to organize team conversations</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {spaces.map((space: any) => {
                      const isProjectInSpace = (project as any)?.spaceId === space.id || (project as any)?.teamSpace?.id === space.id;
                      const projectCount = space.projects?.length || 0;
                      return (
                        <Card 
                          key={space.id} 
                          className={cn(
                            "cursor-pointer hover:shadow-md transition-all duration-200 border",
                            isProjectInSpace 
                              ? "border-primary/50 bg-primary/5" 
                              : "border-border/40 bg-card"
                          )}
                        >
                          <CardHeader className="pb-3 px-4 pt-4">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                              {space.name}
                              {isProjectInSpace && (
                                <Badge variant="outline" className="text-xs">Current</Badge>
                              )}
                            </CardTitle>
                            {space.description && (
                              <CardDescription className="text-xs mt-1">{space.description}</CardDescription>
                            )}
                          </CardHeader>
                          <CardContent className="pt-0 px-4 pb-4">
                            <div className="text-xs text-muted-foreground">
                              {projectCount} project{projectCount !== 1 ? "s" : ""}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}


        <InviteTeamModal
          open={isInviteModalOpen}
          onOpenChange={setIsInviteModalOpen}
          projectUid={projectId}
          projectOwnerId={(project as any)?.ownerId || (project as any)?.owner?.id}
          existingMembers={members.map((m: any) => ({
            userId: m.userId || m.user?.id,
            user: m.user,
            role: m.role,
          }))}
          existingMemberIds={existingMemberIds}
          onInvite={async (input) => {
            await inviteMembers(input).then(() => undefined);
          }}
          isLoading={isInviting}
        />

        <CreateSpaceModal
          open={isCreateSpaceModalOpen}
          onOpenChange={setIsCreateSpaceModalOpen}
          onCreate={createSpace}
          isLoading={createSpaceMutation.isPending}
        />
      </div>
      
      {/* Sprint Modal */}
      <SprintFormModal
        open={isSprintModalOpen}
        onOpenChange={(open) => {
          setIsSprintModalOpen(open);
          if (!open) {
            setEditingSprint(null);
          }
        }}
        onSubmit={handleSprintSubmit}
        sprint={editingSprint}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
}
