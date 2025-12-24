"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ProjectsPageTemplate } from "@/template/page/projects.template";
import { useProjects } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
import { useCosts } from "@/hooks/use-costs";
import { useExpenses } from "@/hooks/use-expenses";
import { useBudgets } from "@/hooks/use-budgets";
import { ProjectFormModal } from "@/components/molecules/projects/project-form-modal";
import type { ProjectFormData } from "@/core/schemas/project-schema";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/atoms/loading-screen";
import { teamSpacesApi } from "@/core/services/api-helpers";
import { Button } from "@/components/atoms/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { toNumber } from "@/shared/utils/format";

export default function ProjectsPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  
  const { projects, isLoading, error, createProject, updateProject, isCreating, isUpdating } = useProjects();
  const { tasks: allTasks, isLoading: isLoadingTasks } = useTasks();
  const { costs: allCosts, isLoading: isLoadingCosts } = useCosts();
  const { expenses: allExpenses, isLoading: isLoadingExpenses } = useExpenses();
  const { budgets: allBudgets, isLoading: isLoadingBudgets } = useBudgets();

  // Calculate budget and task count for each project
  const transformedProjects = useMemo(() => {
    return projects.map((project) => {
      // Get tasks for this project
      const projectTasks = allTasks.filter((task) => {
        return task.projectId && task.projectId === project.uid;
      });
      
      // Get costs for this project
      const projectCosts = allCosts.filter((cost) => cost.projectId === project.uid);
      const totalCosts = projectCosts.reduce((sum, cost) => sum + toNumber(cost.amount), 0);
      
      // Get expenses for this project (active monthly expenses only)
      const projectExpenses = allExpenses.filter((expense) => expense.projectId === project.uid && expense.isActive);
      const monthlyExpenses = projectExpenses.reduce((sum, expense) => {
        // Convert to monthly equivalent
        let multiplier = 1;
        if (expense.frequency === "daily") multiplier = 30;
        else if (expense.frequency === "weekly") multiplier = 4.33;
        else if (expense.frequency === "yearly") multiplier = 1 / 12;
        else if (expense.frequency === "one-time") multiplier = 0;
        return sum + (toNumber(expense.amount) * multiplier);
      }, 0);
      
      // Get budgets for this project
      const projectBudgets = allBudgets.filter((budget) => budget.projectId === project.uid);
      const totalBudget = projectBudgets.reduce((sum, budget) => {
        // Convert to monthly equivalent for comparison
        let multiplier = 1;
        if (budget.period === "daily") multiplier = 30;
        else if (budget.period === "weekly") multiplier = 4.33;
        else if (budget.period === "yearly") multiplier = 1 / 12;
        return sum + (toNumber(budget.amount) * multiplier);
      }, 0);
      
      // Calculate spent (costs + monthly expenses)
      const spent = totalCosts + monthlyExpenses;
      
      return {
        uid: project.uid,
        name: project.name,
        description: project.description,
        status: (project.status || "active") as "active" | "archived" | "on-hold",
        progress: project.progress || 0,
        budget: {
          total: totalBudget || 0,
          spent: spent,
          currency: "USD" as const,
        },
        taskCount: projectTasks.length,
        startDate: project.startDate ? new Date(project.startDate) : undefined,
        endDate: project.endDate ? new Date(project.endDate) : undefined,
      };
    });
  }, [projects, allTasks, allCosts, allExpenses, allBudgets]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency as any,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleEditProject = (project: any) => {
    // Find the full project data from the projects array
    const fullProject = projects.find(p => p.uid === project.uid);
    if (fullProject) {
      setEditingProject(fullProject);
      setIsModalOpen(true);
    }
  };

  const handleSubmit = async (data: ProjectFormData) => {
    try {
      // Convert dates to ISO strings for backend
      const { createSpace, spaceName, spaceDescription, spaceId, ...projectData } = data;
      
      let finalSpaceId = spaceId;
      
      // Create space if requested
      if (createSpace && spaceName) {
        try {
          const newSpace = await teamSpacesApi.create({
            name: spaceName,
            description: spaceDescription || undefined,
          });
          finalSpaceId = newSpace.id;
          toast.success("Team space created successfully");
        } catch (spaceError: any) {
          console.error("Failed to create space:", spaceError);
          toast.error("Failed to create space");
          return;
        }
      }
      
      const submitData = {
        ...projectData,
        spaceId: finalSpaceId,
        startDate: projectData.startDate ? projectData.startDate.toISOString() : undefined,
        endDate: projectData.endDate ? projectData.endDate.toISOString() : undefined,
      };
      
      if (editingProject) {
        await updateProject({ uid: editingProject.uid, data: submitData });
        toast.success("Project updated successfully");
        setIsModalOpen(false);
        setEditingProject(null);
      } else {
        await createProject(submitData);
        toast.success("Project created successfully");
        setIsModalOpen(false);
      }
    } catch (error: any) {
      toast.error(error?.message || "An error occurred");
    }
  };

  const isLoadingData = isLoading || isLoadingTasks || isLoadingCosts || isLoadingExpenses || isLoadingBudgets;

  if (isLoadingData) {
    return <LoadingScreen type="projects" />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="h-16 w-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold">Unable to load projects</h2>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : "There was an error loading your projects. Please try refreshing the page."}
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
      <ProjectsPageTemplate
        projects={transformedProjects}
        onProjectClick={(projectId) => router.push(`/projects/${projectId}`)}
        onCreateProject={handleCreateProject}
        onEditProject={handleEditProject}
        formatCurrency={formatCurrency}
      />
      
      <ProjectFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleSubmit}
        project={editingProject}
        isLoading={isCreating || isUpdating}
      />
    </>
  );
}
