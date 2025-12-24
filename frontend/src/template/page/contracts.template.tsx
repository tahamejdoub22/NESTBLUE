import { PageHeader } from "@/components/layouts/page-header";
import { Button } from "@/components/atoms/button";
import { Tabs } from "@/components/molecules/tabs";
import { Plus, Grid3x3, List, Download, FileText } from "lucide-react";
import { ContractStatistics } from "@/components/molecules/contracts/contract-statistics";
import { ContractFilters } from "@/components/molecules/contracts/contract-filters";
import { ContractFormModal } from "@/components/molecules/contracts/contract-form-modal";
import { ContractListView } from "@/components/molecules/contracts/contract-list-view";
import type { Contract, ContractStatus, CostCategory } from "@/interfaces";

export interface ContractsPageTemplateProps {
  viewMode: "grid" | "list";
  isModalOpen: boolean;
  editingContract: Contract | null;
  search: string;
  status: ContractStatus | undefined;
  category: CostCategory | undefined;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  projectId: string | undefined;
  filteredContracts: Contract[];
  hasActiveFilters: boolean;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  contracts: Contract[];
  onViewModeChange: (mode: "grid" | "list") => void;
  onOpenModal: () => void;
  onCloseModal: () => void;
  onEditContract: (contract: Contract) => void;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: ContractStatus | undefined) => void;
  onCategoryChange: (value: CostCategory | undefined) => void;
  onDateFromChange: (date: Date | undefined) => void;
  onDateToChange: (date: Date | undefined) => void;
  onProjectIdChange: (id: string | undefined) => void;
  onClearFilters: () => void;
  onSubmit: (data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function renderContractsPage(props: ContractsPageTemplateProps) {
  const {
    viewMode,
    isModalOpen,
    editingContract,
    search,
    status,
    category,
    dateFrom,
    dateTo,
    projectId,
    filteredContracts,
    hasActiveFilters,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    contracts,
    onViewModeChange,
    onOpenModal,
    onCloseModal,
    onEditContract,
    onSearchChange,
    onStatusChange,
    onCategoryChange,
    onDateFromChange,
    onDateToChange,
    onProjectIdChange,
    onClearFilters,
    onSubmit,
    onDelete,
  } = props;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contracts"
        description="Manage vendor contracts and agreements"
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
          <Button variant="outline" size="sm" className="gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </Button>
          <Button size="sm" onClick={onOpenModal} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Contract
          </Button>
        </div>
      </PageHeader>

      <Tabs defaultValue="overview" className="space-y-6">
        <Tabs.List>
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="contracts">Contracts</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="overview" className="space-y-6">
          <ContractStatistics contracts={contracts} />
        </Tabs.Content>

        <Tabs.Content value="contracts" className="space-y-6">
          <ContractFilters
            search={search}
            status={status}
            category={category}
            dateFrom={dateFrom}
            dateTo={dateTo}
            projectId={projectId}
            onSearchChange={onSearchChange}
            onStatusChange={onStatusChange}
            onCategoryChange={onCategoryChange}
            onDateFromChange={onDateFromChange}
            onDateToChange={onDateToChange}
            onProjectIdChange={onProjectIdChange}
            onClearFilters={onClearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          <ContractListView
            contracts={filteredContracts}
            viewMode={viewMode}
            isLoading={isLoading}
            onEdit={onEditContract}
            onDelete={onDelete}
          />
        </Tabs.Content>
      </Tabs>

      <ContractFormModal
        open={isModalOpen}
        onOpenChange={onCloseModal}
        contract={editingContract}
        onSubmit={onSubmit}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
}

