"use client";

import { useState, useMemo, useEffect } from "react";
import { PageHeader } from "@/components/layouts/page-header";
import { Button } from "@/components/atoms/button";
import { Tabs } from "@/components/molecules/tabs";
import { Plus, Grid3x3, List } from "lucide-react";
import { ExpenseStatistics } from "@/components/molecules/expenses/expense-statistics";
import { ExpenseFilters } from "@/components/molecules/expenses/expense-filters";
import { ExpenseFormModal } from "@/components/molecules/expenses/expense-form-modal";
import { ExpenseListView } from "@/components/molecules/expenses/expense-list-view";
import { useExpenses } from "@/hooks/use-expenses";
import { useCosts } from "@/hooks/use-costs";
import { useBudgets } from "@/hooks/use-budgets";
import type { ExpenseFormData } from "@/core/schemas/expense-schema";
import type { Expense, CostCategory } from "@/interfaces";
import { useExpensesStore } from "@/core/store/expenses-store";
import { ProjectCostAnalysis } from "@/components/molecules/project-cost-analysis";
import { toast } from "sonner";
import { downloadExpensesPDF } from "@/shared/utils/pdf";
import { Download } from "lucide-react";
export default function ExpensesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CostCategory | undefined>();
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly" | "yearly" | "one-time" | undefined>();
  const [isActive, setIsActive] = useState<boolean | undefined>();
  const [projectId, setProjectId] = useState<string | undefined>();

  const { expenses, isLoading, createExpense, updateExpense, deleteExpense, isCreating, isUpdating, isDeleting } = useExpenses();
  const { setFilters, clearFilters } = useExpensesStore();
  // Use hooks to ensure data is fetched from backend
  const { costs } = useCosts();
  const { budgets } = useBudgets();

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (expense) =>
          expense.name.toLowerCase().includes(searchLower) ||
          expense.description?.toLowerCase().includes(searchLower)
      );
    }

    if (category) {
      filtered = filtered.filter((expense) => expense.category === category);
    }

    if (frequency) {
      filtered = filtered.filter((expense) => expense.frequency === frequency);
    }

    if (isActive !== undefined) {
      filtered = filtered.filter((expense) => expense.isActive === isActive);
    }

    // Project filter
    if (projectId) {
      if (projectId === "unassigned") {
        // Show expenses without a project
        filtered = filtered.filter((expense) => !expense.projectId);
      } else {
        // Show expenses for specific project
        filtered = filtered.filter((expense) => expense.projectId === projectId);
      }
    }

    return filtered.sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }, [expenses, search, category, frequency, isActive, projectId]);

  const hasActiveFilters = useMemo(() => {
    return !!(search || category || frequency || isActive !== undefined || projectId);
  }, [search, category, frequency, isActive, projectId]);

  const handleSubmit = async (data: ExpenseFormData) => {
    try {
      if (editingExpense) {
        await updateExpense({ id: editingExpense.id, data });
        toast.success("Expense updated successfully");
        setIsModalOpen(false);
        setEditingExpense(null);
      } else {
        await createExpense(data);
        toast.success("Expense created successfully");
        setIsModalOpen(false);
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpense(id);
        toast.success("Expense deleted successfully");
      } catch (error) {
        toast.error("Failed to delete expense");
      }
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleClearFilters = () => {
    setSearch("");
    setCategory(undefined);
    setFrequency(undefined);
    setIsActive(undefined);
    setProjectId(undefined);
    clearFilters();
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setFilters({
        search,
        category,
        frequency,
        isActive,
      });
    }
  }, [search, category, frequency, isActive, setFilters]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Manage recurring expenses and subscriptions"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadExpensesPDF(filteredExpenses, "Expenses Report")}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
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
          <Button size="sm" onClick={handleAddNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </PageHeader>

      <Tabs defaultValue="overview" className="space-y-6">
        <Tabs.List>
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="expenses">Expenses</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="overview" className="space-y-6">
          <ExpenseStatistics expenses={expenses} />
          <ProjectCostAnalysis costs={costs} expenses={expenses} budgets={budgets} />
        </Tabs.Content>

        <Tabs.Content value="expenses" className="space-y-6">
          <ExpenseFilters
            search={search}
            category={category}
            frequency={frequency}
            isActive={isActive}
            projectId={projectId}
            onSearchChange={setSearch}
            onCategoryChange={setCategory}
            onFrequencyChange={setFrequency}
            onIsActiveChange={setIsActive}
            onProjectIdChange={setProjectId}
            onClearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          <ExpenseListView
            expenses={filteredExpenses}
            viewMode={viewMode}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Tabs.Content>
      </Tabs>

      <ExpenseFormModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setEditingExpense(null);
          }
        }}
        expense={editingExpense}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
}
