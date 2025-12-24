"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useSprints } from "@/hooks/use-sprints";
import { useProjects } from "@/hooks/use-projects";
import { SprintCard } from "@/components/molecules/sprints/sprint-card";
import { SprintFormModal } from "@/components/molecules/sprints/sprint-form-modal";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Badge } from "@/components/atoms/badge";
import { Card, CardContent } from "@/components/atoms/card";
import { Text } from "@/components/atoms/text";
import { LoadingScreen } from "@/components/atoms/loading-screen";
import { PageHeader } from "@/components/layouts/page-header";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, transitions } from "@/lib/motion";
import {
  Plus,
  Search,
  Filter,
  Target,
  Calendar,
  CheckCircle2,
  Clock,
  PlayCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import type { Sprint } from "@/interfaces";
import type { SprintFormData } from "@/core/schemas/sprint-schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";

const STATUS_FILTERS = [
  { value: "all", label: "All Sprints", icon: Target },
  { value: "planned", label: "Planned", icon: Clock },
  { value: "active", label: "Active", icon: PlayCircle },
  { value: "completed", label: "Completed", icon: CheckCircle2 },
];

export default function SprintsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  
  const { sprints, isLoading, error, createSprint, updateSprint, deleteSprint, isCreating, isUpdating, isDeleting } = useSprints();
  const { projects } = useProjects();

  // Filter sprints
  const filteredSprints = useMemo(() => {
    let filtered = sprints;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((sprint) => sprint.status === statusFilter);
    }

    // Filter by project
    if (projectFilter !== "all") {
      filtered = filtered.filter((sprint) => sprint.projectId === projectFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (sprint) =>
          sprint.name.toLowerCase().includes(query) ||
          sprint.goal?.toLowerCase().includes(query) ||
          projects.find((p) => p.uid === sprint.projectId)?.name.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [sprints, statusFilter, projectFilter, searchQuery, projects]);

  // Group sprints by status
  const groupedSprints = useMemo(() => {
    const groups: Record<string, Sprint[]> = {
      active: [],
      planned: [],
      completed: [],
    };

    filteredSprints.forEach((sprint) => {
      if (groups[sprint.status]) {
        groups[sprint.status].push(sprint);
      }
    });

    return groups;
  }, [filteredSprints]);

  // Statistics
  const stats = useMemo(() => {
    const total = sprints.length;
    const active = sprints.filter((s) => s.status === "active").length;
    const planned = sprints.filter((s) => s.status === "planned").length;
    const completed = sprints.filter((s) => s.status === "completed").length;
    const totalTasks = sprints.reduce((sum, s) => sum + s.taskCount, 0);
    const completedTasks = sprints.reduce((sum, s) => sum + s.completedTaskCount, 0);
    const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      total,
      active,
      planned,
      completed,
      overallProgress,
      totalTasks,
      completedTasks,
    };
  }, [sprints]);

  const handleCreateSprint = () => {
    setEditingSprint(null);
    setIsModalOpen(true);
  };

  const handleEditSprint = (sprint: Sprint) => {
    setEditingSprint(sprint);
    setIsModalOpen(true);
  };

  const handleDeleteSprint = async (sprint: Sprint) => {
    if (!confirm(`Are you sure you want to delete "${sprint.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteSprint(sprint.uid);
      toast.success("Sprint deleted successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete sprint");
    }
  };

  const handleSubmit = async (data: SprintFormData) => {
    try {
      const submitData = {
        ...data,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
      };

      if (editingSprint) {
        await updateSprint({ id: editingSprint.uid, data: submitData });
        toast.success("Sprint updated successfully");
        setIsModalOpen(false);
        setEditingSprint(null);
      } else {
        await createSprint(submitData);
        toast.success("Sprint created successfully");
        setIsModalOpen(false);
      }
    } catch (error: any) {
      toast.error(error?.message || "An error occurred");
    }
  };

  if (isLoading) {
    return <LoadingScreen type="default" message="Loading sprints..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="h-16 w-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold">Unable to load sprints</h2>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : "There was an error loading your sprints. Please try refreshing the page."}
          </p>
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Sprint Management"
          description="Plan, track, and manage your project sprints"
          action={
            <Button onClick={handleCreateSprint} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Sprint
            </Button>
          }
        />

        {/* Statistics */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <motion.div key="stat-total" variants={fadeInUp}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Text variant="small" className="text-muted-foreground mb-1">
                      Total Sprints
                    </Text>
                    <Text variant="h3" className="font-bold">
                      {stats.total}
                    </Text>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div key="stat-active" variants={fadeInUp}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Text variant="small" className="text-muted-foreground mb-1">
                      Active Sprints
                    </Text>
                    <Text variant="h3" className="font-bold text-green-600">
                      {stats.active}
                    </Text>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <PlayCircle className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div key="stat-progress" variants={fadeInUp}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Text variant="small" className="text-muted-foreground mb-1">
                      Overall Progress
                    </Text>
                    <Text variant="h3" className="font-bold">
                      {stats.overallProgress}%
                    </Text>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div key="stat-tasks" variants={fadeInUp}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Text variant="small" className="text-muted-foreground mb-1">
                      Tasks Completed
                    </Text>
                    <Text variant="h3" className="font-bold">
                      {stats.completedTasks} / {stats.totalTasks}
                    </Text>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Filters */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sprints by name, goal, or project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((filter) => {
                const Icon = filter.icon;
                return (
                  <SelectItem key={filter.value} value={filter.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {filter.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.uid} value={project.uid}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Sprints Grid */}
        {filteredSprints.length === 0 ? (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center justify-center py-16 px-4"
          >
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Target className="h-10 w-10 text-muted-foreground" />
            </div>
            <Text variant="h3" className="font-semibold mb-2">
              {searchQuery || statusFilter !== "all" || projectFilter !== "all"
                ? "No sprints found"
                : "No sprints yet"}
            </Text>
            <Text variant="small" className="text-muted-foreground text-center max-w-md mb-6">
              {searchQuery || statusFilter !== "all" || projectFilter !== "all"
                ? "Try adjusting your filters or search query to find sprints."
                : "Get started by creating your first sprint to organize and track your project tasks."}
            </Text>
            {!searchQuery && statusFilter === "all" && projectFilter === "all" && (
              <Button onClick={handleCreateSprint} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Sprint
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredSprints.map((sprint, index) => (
              <motion.div key={sprint.uid || sprint.id || `sprint-${index}`} variants={fadeInUp}>
                <SprintCard
                  sprint={sprint}
                  onEdit={handleEditSprint}
                  onDelete={handleDeleteSprint}
                  isDeleting={isDeleting}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <SprintFormModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setEditingSprint(null);
          }
        }}
        onSubmit={handleSubmit}
        sprint={editingSprint}
        isLoading={isCreating || isUpdating}
      />
    </>
  );
}

