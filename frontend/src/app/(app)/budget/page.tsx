"use client";

import { useState, useMemo, useEffect } from "react";
import { PageHeader } from "@/components/layouts/page-header";
import { Button } from "@/components/atoms/button";
import { Tabs } from "@/components/molecules/tabs";
import { Plus, Grid3x3, List, Download } from "lucide-react";
import { BudgetStatistics } from "@/components/molecules/budgets/budget-statistics";
import { BudgetFilters } from "@/components/molecules/budgets/budget-filters";
import { BudgetFormModal } from "@/components/molecules/budgets/budget-form-modal";
import { BudgetListView } from "@/components/molecules/budgets/budget-list-view";
import { useBudgets } from "@/hooks/use-budgets";
import { useCosts } from "@/hooks/use-costs";
import { useExpenses } from "@/hooks/use-expenses";
import type { BudgetFormData } from "@/core/schemas/budget-schema";
import type { Budget, CostCategory } from "@/interfaces";
import { useBudgetsStore } from "@/core/store/budgets-store";
import { ProjectCostAnalysis } from "@/components/molecules/project-cost-analysis";
import { toast } from "sonner";
import { downloadBudgetsPDF } from "@/shared/utils/pdf";

export default function BudgetPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CostCategory | undefined>();
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly" | undefined>();
  const [projectId, setProjectId] = useState<string | undefined>();

  const { budgets, isLoading, createBudget, updateBudget, deleteBudget, isCreating, isUpdating, isDeleting } = useBudgets();
  const { setFilters, clearFilters } = useBudgetsStore();
  // Use hooks to ensure data is fetched from backend
  const { costs } = useCosts();
  const { expenses } = useExpenses();

  // Filter budgets based on search, category, and period
  const filteredBudgets = useMemo(() => {
    let filtered = [...budgets];

    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((budget) =>
        budget.name.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (category) {
      filtered = filtered.filter((budget) => budget.category === category);
    }

    // Period filter
    if (period) {
      filtered = filtered.filter((budget) => budget.period === period);
    }

    // Project filter
    if (projectId) {
      if (projectId === "unassigned") {
        // Show budgets without a project
        filtered = filtered.filter((budget) => !budget.projectId);
      } else {
        // Show budgets for specific project
        filtered = filtered.filter((budget) => budget.projectId === projectId);
      }
    }

    // Sort by start date (newest first)
    return filtered.sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }, [budgets, search, category, period, projectId]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return !!(search || category || period || projectId);
  }, [search, category, period, projectId]);

  // Handle form submission
  const handleSubmit = async (data: BudgetFormData) => {
    try {
      if (editingBudget) {
        await updateBudget({ id: editingBudget.id, data });
        toast.success("Budget updated successfully");
        setIsModalOpen(false);
        setEditingBudget(null);
      } else {
        await createBudget(data);
        toast.success("Budget created successfully");
        setIsModalOpen(false);
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this budget?")) {
      try {
        await deleteBudget(id);
        toast.success("Budget deleted successfully");
      } catch (error) {
        toast.error("Failed to delete budget");
      }
    }
  };

  // Handle edit
  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearch("");
    setCategory(undefined);
    setPeriod(undefined);
    setProjectId(undefined);
    clearFilters();
  };

  // Update store filters (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setFilters({
        search,
        category,
        period,
      });
    }
  }, [search, category, period, setFilters]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budgets"
        description="Set and track your project budgets"
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border border-border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => downloadBudgetsPDF(filteredBudgets, "Budgets Report")} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={handleAddNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Budget
          </Button>
        </div>
      </PageHeader>

      <Tabs defaultValue="overview" className="space-y-6">
        <Tabs.List>
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="budgets">Budgets</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="overview" className="space-y-6">
          <BudgetStatistics budgets={budgets} />
          <ProjectCostAnalysis costs={costs} expenses={expenses} budgets={budgets} />
        </Tabs.Content>

        <Tabs.Content value="budgets" className="space-y-6">
          <BudgetFilters
            search={search}
            category={category}
            period={period}
            projectId={projectId}
            onSearchChange={setSearch}
            onCategoryChange={setCategory}
            onPeriodChange={setPeriod}
            onProjectChange={setProjectId}
            onClearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          <BudgetListView
            budgets={filteredBudgets}
            viewMode={viewMode}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Tabs.Content>
      </Tabs>

      <BudgetFormModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setEditingBudget(null);
          }
        }}
        budget={editingBudget}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
}
