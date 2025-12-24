import { PageHeader } from "@/components/layouts/page-header";
import { Button } from "@/components/atoms/button";
import { Tabs } from "@/components/molecules/tabs";
import { Plus, Grid3x3, List, Download } from "lucide-react";
import { CostStatistics } from "@/components/molecules/costs/cost-statistics";
import { CostFilters } from "@/components/molecules/costs/cost-filters";
import { CostFormModal } from "@/components/molecules/costs/cost-form-modal";
import { CostListView } from "@/components/molecules/costs/cost-list-view";
import type { Cost, CostCategory } from "@/interfaces";
import { ProjectCostAnalysis } from "@/components/molecules/project-cost-analysis";

export interface CostsPageTemplateProps {
  viewMode: "grid" | "list";
  isModalOpen: boolean;
  editingCost: Cost | null;
  search: string;
  category: CostCategory | undefined;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  projectId: string | undefined;
  filteredCosts: Cost[];
  hasActiveFilters: boolean;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  costs: Cost[];
  expenses: any[];
  budgets: any[];
  onViewModeChange: (mode: "grid" | "list") => void;
  onOpenModal: () => void;
  onCloseModal: () => void;
  onEditCost: (cost: Cost) => void;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: CostCategory | undefined) => void;
  onDateFromChange: (date: Date | undefined) => void;
  onDateToChange: (date: Date | undefined) => void;
  onProjectIdChange: (id: string | undefined) => void;
  onClearFilters: () => void;
  onSubmit: (data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onDownloadPDF: () => void;
}

export function renderCostsPage(props: CostsPageTemplateProps) {
  const {
    viewMode,
    isModalOpen,
    editingCost,
    search,
    category,
    dateFrom,
    dateTo,
    projectId,
    filteredCosts,
    hasActiveFilters,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    costs,
    expenses,
    budgets,
    onViewModeChange,
    onOpenModal,
    onCloseModal,
    onEditCost,
    onSearchChange,
    onCategoryChange,
    onDateFromChange,
    onDateToChange,
    onProjectIdChange,
    onClearFilters,
    onSubmit,
    onDelete,
    onDownloadPDF,
  } = props;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Costs"
        description="Track and manage your project costs"
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
            Add Cost
          </Button>
        </div>
      </PageHeader>

      <Tabs defaultValue="overview" className="space-y-6">
        <Tabs.List>
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="costs">Costs</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="overview" className="space-y-6">
          <CostStatistics costs={costs} />
          <ProjectCostAnalysis costs={costs} expenses={expenses} budgets={budgets} />
        </Tabs.Content>

        <Tabs.Content value="costs" className="space-y-6">
          <CostFilters
            search={search}
            category={category}
            dateFrom={dateFrom}
            dateTo={dateTo}
            projectId={projectId}
            onSearchChange={onSearchChange}
            onCategoryChange={onCategoryChange}
            onDateFromChange={onDateFromChange}
            onDateToChange={onDateToChange}
            onProjectChange={onProjectIdChange}
            onClearFilters={onClearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          <CostListView
            costs={filteredCosts}
            viewMode={viewMode}
            isLoading={isLoading}
            onEdit={onEditCost}
            onDelete={onDelete}
          />
        </Tabs.Content>
      </Tabs>

      <CostFormModal
        open={isModalOpen}
        onOpenChange={onCloseModal}
        cost={editingCost}
        onSubmit={onSubmit}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
}

