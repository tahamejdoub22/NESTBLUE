import { PageHeader } from "@/components/layouts/page-header";
import { Button } from "@/components/atoms/button";
import { Tabs } from "@/components/molecules/tabs";
import { Plus, Grid3x3, List, Download } from "lucide-react";
import { BudgetStatistics } from "@/components/molecules/budgets/budget-statistics";
import { BudgetFilters } from "@/components/molecules/budgets/budget-filters";
import { BudgetFormModal } from "@/components/molecules/budgets/budget-form-modal";
import { BudgetListView } from "@/components/molecules/budgets/budget-list-view";
import type { Budget, CostCategory } from "@/interfaces";
import { ProjectCostAnalysis } from "@/components/molecules/project-cost-analysis";

export interface BudgetPageTemplateProps {
  viewMode: "grid" | "list";
  isModalOpen: boolean;
  editingBudget: Budget | null;
  search: string;
  category: CostCategory | undefined;
  period: "daily" | "weekly" | "monthly" | "yearly" | undefined;
  projectId: string | undefined;
  filteredBudgets: Budget[];
  hasActiveFilters: boolean;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  budgets: Budget[];
  costs: any[];
  expenses: any[];
  onViewModeChange: (mode: "grid" | "list") => void;
  onOpenModal: () => void;
  onCloseModal: () => void;
  onEditBudget: (budget: Budget) => void;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: CostCategory | undefined) => void;
  onPeriodChange: (value: "daily" | "weekly" | "monthly" | "yearly" | undefined) => void;
  onProjectIdChange: (id: string | undefined) => void;
  onClearFilters: () => void;
  onSubmit: (data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onDownloadPDF: () => void;
}

export function renderBudgetPage(props: BudgetPageTemplateProps) {
  const {
    viewMode,
    isModalOpen,
    editingBudget,
    search,
    category,
    period,
    projectId,
    filteredBudgets,
    hasActiveFilters,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    budgets,
    costs,
    expenses,
    onViewModeChange,
    onOpenModal,
    onCloseModal,
    onEditBudget,
    onSearchChange,
    onCategoryChange,
    onPeriodChange,
    onProjectIdChange,
    onClearFilters,
    onSubmit,
    onDelete,
    onDownloadPDF,
  } = props;

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
          <Button variant="outline" size="sm" onClick={onDownloadPDF} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={onOpenModal} className="gap-2">
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
            onSearchChange={onSearchChange}
            onCategoryChange={onCategoryChange}
            onPeriodChange={onPeriodChange}
            onProjectChange={onProjectIdChange}
            onClearFilters={onClearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          <BudgetListView
            budgets={filteredBudgets}
            viewMode={viewMode}
            isLoading={isLoading}
            onEdit={onEditBudget}
            onDelete={onDelete}
          />
        </Tabs.Content>
      </Tabs>

      <BudgetFormModal
        open={isModalOpen}
        onOpenChange={onCloseModal}
        budget={editingBudget}
        onSubmit={onSubmit}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
}

