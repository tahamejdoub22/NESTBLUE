"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { Progress } from "@/components/atoms/progress";
import { Input } from "@/components/atoms/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select";
import { 
  FolderKanban, 
  ArrowRight, 
  Plus, 
  DollarSign, 
  Calendar, 
  FileText, 
  Search,
  Filter,
  Grid3x3,
  List,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  MoreVertical,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, transitions } from "@/lib/motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/atoms/tooltip";
import { format } from "date-fns";

export interface Project {
  uid: string;
  name: string;
  description: string;
  status: "active" | "archived" | "on-hold";
  progress: number;
  budget: { total: number; spent: number; currency: "USD" | "EUR" | "GBP" | "MAD" };
  taskCount: number;
  startDate?: Date;
  endDate?: Date;
}

export interface ProjectsPageTemplateProps {
  projects: Project[];
  onProjectClick: (projectId: string) => void;
  onCreateProject: () => void;
  onEditProject?: (project: Project) => void;
  formatCurrency: (amount: number, currency: string) => string;
}

export function ProjectsPageTemplate(props: ProjectsPageTemplateProps) {
  const {
    projects,
    onProjectClick,
    onCreateProject,
    onEditProject,
    formatCurrency,
  } = props;

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter and search projects
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        statusFilter === "all" || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const active = projects.filter(p => p.status === "active").length;
    const totalBudget = projects.reduce((sum, p) => sum + p.budget.total, 0);
    const totalSpent = projects.reduce((sum, p) => sum + p.budget.spent, 0);
    const totalTasks = projects.reduce((sum, p) => sum + p.taskCount, 0);
    const avgProgress = projects.length > 0 
      ? projects.reduce((sum, p) => sum + p.progress, 0) / projects.length 
      : 0;

    return { active, totalBudget, totalSpent, totalTasks, avgProgress };
  }, [projects]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-3.5 w-3.5" />;
      case "on-hold":
        return <Clock className="h-3.5 w-3.5" />;
      case "archived":
        return <AlertCircle className="h-3.5 w-3.5" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "on-hold":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "archived":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6 bg-[#F7F9FC] dark:bg-background min-h-screen p-6">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-[1920px] mx-auto space-y-6"
      >
        {/* Header Section */}
        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">
              Projects
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your projects, budgets, and team collaboration
            </p>
          </div>
          <Button 
            onClick={onCreateProject}
            className="h-9 px-4 gap-2"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div 
          variants={fadeInUp}
          transition={{ ...transitions.default, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2"
        >
          <Card className="border border-border/40 bg-card hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Active Projects</p>
                  <p className="text-2xl font-bold text-foreground">{stats.active}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FolderKanban className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/40 bg-card hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Total Budget</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(stats.totalBudget, "USD")}
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
                  <p className="text-xs font-medium text-muted-foreground mb-1">Total Tasks</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalTasks}</p>
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
                  <p className="text-xs font-medium text-muted-foreground mb-1">Avg. Progress</p>
                  <p className="text-2xl font-bold text-foreground">{Math.round(stats.avgProgress)}%</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          variants={fadeInUp}
          transition={{ ...transitions.default, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] h-9">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-1 border border-border/40 rounded-lg p-1 bg-card">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="h-7 px-2"
                    aria-label="Grid view"
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Grid view</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="h-7 px-2"
                    aria-label="List view"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>List view</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </motion.div>

        {/* Projects Grid/List */}
        {filteredProjects.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className={cn(
              viewMode === "grid"
                ? "grid gap-2 md:grid-cols-2 lg:grid-cols-3"
                : "space-y-2"
            )}
          >
            {filteredProjects.map((project, index) => {
              const budgetUtilization = project.budget.total > 0 
                ? (project.budget.spent / project.budget.total) * 100 
                : 0;
              const isOverBudget = budgetUtilization > 100;
              const isNearBudget = budgetUtilization > 80 && budgetUtilization <= 100;
              const remaining = project.budget.total - project.budget.spent;

              return (
                <motion.div
                  key={project.uid}
                  variants={fadeInUp}
                  transition={{ ...transitions.default, delay: index * 0.05 }}
                >
                  <Card
                    className={cn(
                      "cursor-pointer transition-all duration-200 h-full",
                      "border border-border/40 bg-card hover:shadow-md hover:border-primary/30",
                      project.status === "on-hold" && "opacity-75",
                      viewMode === "list" && "flex flex-row"
                    )}
                    onClick={() => onProjectClick(project.uid)}
                  >
                    {viewMode === "grid" ? (
                      <>
                        <CardHeader className="pb-3 px-4 pt-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
                                <FolderKanban className="h-6 w-6 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-base font-semibold truncate mb-1">
                                  {project.name}
                                </CardTitle>
                                <CardDescription className="line-clamp-2 text-xs">
                                  {project.description || "No description"}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "capitalize flex-shrink-0 flex items-center gap-1 text-xs",
                                  getStatusColor(project.status)
                                )}
                              >
                                {getStatusIcon(project.status)}
                                {project.status}
                              </Badge>
                              {onEditProject && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onEditProject(project);
                                        }}
                                        aria-label="Edit project"
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Edit project</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 space-y-4">
                          {/* Progress */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-semibold text-foreground">{project.progress}%</span>
                            </div>
                            <Progress value={project.progress} className="h-1.5" />
                          </div>

                          {/* Budget Info */}
                          <div className="space-y-1.5 pt-2 border-t border-border/40">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                Budget
                              </span>
                              <span
                                className={cn(
                                  "font-semibold",
                                  isOverBudget && "text-red-600 dark:text-red-400",
                                  isNearBudget && "text-amber-600 dark:text-amber-400",
                                  !isOverBudget && !isNearBudget && "text-emerald-600 dark:text-emerald-400"
                                )}
                              >
                                {budgetUtilization.toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                {formatCurrency(project.budget.spent, project.budget.currency)} /{" "}
                                {formatCurrency(project.budget.total, project.budget.currency)}
                              </span>
                              <span
                                className={cn(
                                  "font-medium",
                                  remaining < 0
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-emerald-600 dark:text-emerald-400"
                                )}
                              >
                                {formatCurrency(Math.abs(remaining), project.budget.currency)} left
                              </span>
                            </div>
                            <Progress
                              value={Math.min(budgetUtilization, 100)}
                              className={cn(
                                "h-1.5",
                                isOverBudget && "[&>div]:bg-red-500",
                                isNearBudget && "[&>div]:bg-amber-500",
                                !isOverBudget && !isNearBudget && "[&>div]:bg-emerald-500"
                              )}
                            />
                          </div>

                          {/* Project Stats */}
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40">
                            <div className="flex items-center gap-1.5 text-xs">
                              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-muted-foreground">Tasks:</span>
                              <span className="font-semibold">{project.taskCount}</span>
                            </div>
                            {project.endDate && (
                              <div className="flex items-center gap-1.5 text-xs">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  {format(project.endDate, "MMM yyyy")}
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </>
                    ) : (
                      <div className="flex flex-1 items-center gap-4 p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
                          <FolderKanban className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <CardTitle className="text-base font-semibold truncate">
                              {project.name}
                            </CardTitle>
                            <Badge
                              variant="outline"
                              className={cn(
                                "capitalize flex items-center gap-1 text-xs",
                                getStatusColor(project.status)
                              )}
                            >
                              {getStatusIcon(project.status)}
                              {project.status}
                            </Badge>
                          </div>
                          <CardDescription className="text-xs line-clamp-1 mb-2">
                            {project.description || "No description"}
                          </CardDescription>
                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-muted-foreground">{project.taskCount} tasks</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {formatCurrency(project.budget.spent, project.budget.currency)} / {formatCurrency(project.budget.total, project.budget.currency)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-muted-foreground">Progress:</span>
                              <span className="font-semibold">{project.progress}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {onEditProject && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEditProject(project);
                                    }}
                                    aria-label="Edit project"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit project</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          <Progress value={project.progress} className="w-24 h-2" />
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div variants={fadeInUp}>
            <Card className="border-dashed border-2 border-border/40">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FolderKanban className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No projects found</h3>
                <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Get started by creating your first project"}
                </p>
                {(!searchQuery && statusFilter === "all") && (
                  <Button onClick={onCreateProject}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
