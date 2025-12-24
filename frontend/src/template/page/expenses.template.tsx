import { PageHeader } from "@/components/layouts/page-header";
import { Button } from "@/components/atoms/button";
import { Tabs } from "@/components/molecules/tabs";
import { Plus, Grid3x3, List } from "lucide-react";
import { ExpenseStatistics } from "@/components/molecules/expenses/expense-statistics";
import { ExpenseFilters } from "@/components/molecules/expenses/expense-filters";
import { ExpenseFormModal } from "@/components/molecules/expenses/expense-form-modal";
import { ExpenseListView } from "@/components/molecules/expenses/expense-list-view";
import type { Expense, CostCategory } from "@/interfaces";
import { ProjectCostAnalysis } from "@/components/molecules/project-cost-analysis";

export interface ExpensesPageTemplateProps {
  viewMode: "grid" | "list";
  isModalOpen: boolean;
  editingExpense: Expense | null;
  search: string;
  category: CostCategory | undefined;
  frequency: "daily" | "weekly" | "monthly" | "yearly" | "one-time" | undefined;
  isActive: boolean | undefined;
  projectId: string | undefined;
  filteredExpenses: Expense[];
  hasActiveFilters: boolean;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  expenses: Expense[];
  costs: any[];
  budgets: any[];
  onViewModeChange: (mode: "grid" | "list") => void;
  onOpenModal: () => void;
  onCloseModal: () => void;
  onEditExpense: (expense: Expense) => void;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: CostCategory | undefined) => void;
  onFrequencyChange: (value: "daily" | "weekly" | "monthly" | "yearly" | "one-time" | undefined) => void;
  onIsActiveChange: (value: boolean | undefined) => void;
  onProjectIdChange: (id: string | undefined) => void;
  onClearFilters: () => void;
  onSubmit: (data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function renderExpensesPage(props: ExpensesPageTemplateProps) {
  const {
    viewMode,
    isModalOpen,
    editingExpense,
    search,
    category,
    frequency,
    isActive,
    projectId,
    filteredExpenses,
    hasActiveFilters,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    expenses,
    costs,
    budgets,
    onViewModeChange,
    onOpenModal,
    onCloseModal,
    onEditExpense,
    onSearchChange,
    onCategoryChange,
    onFrequencyChange,
    onIsActiveChange,
    onProjectIdChange,
    onClearFilters,
    onSubmit,
    onDelete,
  } = props;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Manage recurring expenses and subscriptions"
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border border-border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "primary" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("grid")}
              className="h-8"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "primary" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("list")}
              className="h-8"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button size="sm" onClick={onOpenModal} className="gap-2">
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
            onSearchChange={onSearchChange}
            onCategoryChange={onCategoryChange}
            onFrequencyChange={onFrequencyChange}
            onIsActiveChange={onIsActiveChange}
            onProjectIdChange={onProjectIdChange}
            onClearFilters={onClearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          <ExpenseListView
            expenses={filteredExpenses}
            viewMode={viewMode}
            isLoading={isLoading}
            onEdit={onEditExpense}
            onDelete={onDelete}
          />
        </Tabs.Content>
      </Tabs>

      <ExpenseFormModal
        open={isModalOpen}
        onOpenChange={onCloseModal}
        expense={editingExpense}
        onSubmit={onSubmit}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
}

