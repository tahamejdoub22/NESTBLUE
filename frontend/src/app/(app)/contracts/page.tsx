"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Tabs } from "@/components/molecules/tabs";
import { Plus, Grid3x3, List, FileText, Download } from "lucide-react";
import { ContractStatistics } from "@/components/molecules/contracts/contract-statistics";
import { ContractFilters } from "@/components/molecules/contracts/contract-filters";
import { ContractFormModal } from "@/components/molecules/contracts/contract-form-modal";
import { ContractListView } from "@/components/molecules/contracts/contract-list-view";
import { useContracts } from "@/hooks/use-contracts";
import type { ContractFormData } from "@/core/schemas/contract-schema";
import type { Contract, ContractStatus, CostCategory } from "@/interfaces";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/atoms/loading-screen";
import { fadeInUp, transitions } from "@/lib/motion";

export default function ContractsPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "contracts">("overview");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ContractStatus | undefined>();
  const [category, setCategory] = useState<CostCategory | undefined>();
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [projectId, setProjectId] = useState<string | undefined>();

  const { contracts, isLoading, createContract, updateContract, deleteContract, isCreating, isUpdating } = useContracts();

  // Filter contracts based on search, status, category, and date range
  const filteredContracts = useMemo(() => {
    let filtered = [...contracts];

    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (contract) =>
          contract.name.toLowerCase().includes(searchLower) ||
          contract.contractNumber.toLowerCase().includes(searchLower) ||
          contract.vendor.toLowerCase().includes(searchLower) ||
          contract.description?.toLowerCase().includes(searchLower) ||
          contract.vendorEmail?.toLowerCase().includes(searchLower) ||
          contract.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Status filter
    if (status) {
      filtered = filtered.filter((contract) => contract.status === status);
    }

    // Category filter
    if (category) {
      filtered = filtered.filter((contract) => contract.category === category);
    }

    // Date range filter (start date)
    if (dateFrom) {
      filtered = filtered.filter(
        (contract) => new Date(contract.startDate) >= dateFrom
      );
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (contract) => {
          const contractEndDate = contract.endDate ? new Date(contract.endDate) : new Date(contract.startDate);
          return contractEndDate <= toDate;
        }
      );
    }

    // Project filter
    if (projectId) {
      if (projectId === "unassigned") {
        filtered = filtered.filter((contract) => !contract.projectId);
      } else {
        filtered = filtered.filter((contract) => contract.projectId === projectId);
      }
    }

    // Sort by start date (newest first)
    return filtered.sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }, [contracts, search, status, category, dateFrom, dateTo, projectId]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return !!(search || status || category || dateFrom || dateTo || projectId);
  }, [search, status, category, dateFrom, dateTo, projectId]);

  // Handle form submission
  const handleSubmit = async (data: ContractFormData) => {
    try {
      const cleanedData = {
        ...data,
        endDate: data.endDate ?? undefined,
        renewalDate: data.renewalDate ?? undefined,
      };
      
      if (editingContract) {
        await updateContract({ id: editingContract.id, data: cleanedData });
        toast.success("Contract updated successfully");
        setIsModalOpen(false);
        setEditingContract(null);
      } else {
        await createContract(cleanedData);
        toast.success("Contract added successfully");
        setIsModalOpen(false);
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.response?.data?.message || "An error occurred";
      toast.error(errorMessage);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this contract?")) {
      try {
        await deleteContract(id);
        toast.success("Contract deleted successfully");
      } catch (error) {
        toast.error("Failed to delete contract");
      }
    }
  };

  // Handle edit
  const handleEdit = (contract: Contract) => {
    setEditingContract(contract);
    setIsModalOpen(true);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingContract(null);
    setIsModalOpen(true);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearch("");
    setStatus(undefined);
    setCategory(undefined);
    setDateFrom(undefined);
    setDateTo(undefined);
    setProjectId(undefined);
  };

  if (isLoading) {
    return <LoadingScreen type="dashboard" />;
  }

  return (
    <div className="space-y-6 bg-[#F7F9FC] dark:bg-background min-h-screen p-6">
      <div className="max-w-[1920px] mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-1">
              Contracts
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage vendor contracts and agreements
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border border-border/40 rounded-lg p-1 bg-card">
              <Button
                variant={viewMode === "grid" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 px-2"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 px-2"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 px-3 gap-2"
              onClick={async () => {
                try {
                  const { downloadContractsPDF } = await import("@/shared/utils/pdf");
                  await downloadContractsPDF(
                    filteredContracts,
                    "Contracts Report"
                  );
                  toast.success("Contracts report downloaded successfully");
                } catch (error) {
                  console.error("Error generating PDF:", error);
                  toast.error("Failed to generate PDF report");
                }
              }}
            >
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddNew}
              className="h-8 px-3 gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Contract
            </Button>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "overview" | "contracts")}
            items={[
              {
                value: "overview",
                label: `Overview${contracts.length > 0 ? ` (${contracts.length})` : ""}`,
                icon: <FileText className="h-4 w-4" />,
              },
              {
                value: "contracts",
                label: `Contracts${filteredContracts.length > 0 ? ` (${filteredContracts.length})` : ""}`,
                icon: <FileText className="h-4 w-4" />,
              },
            ]}
          />
        </motion.div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-2"
        >
          {activeTab === "overview" && (
            <div className="space-y-2">
              <ContractStatistics contracts={contracts} />
            </div>
          )}

          {activeTab === "contracts" && (
            <div className="space-y-2">
              <ContractFilters
                search={search}
                status={status}
                category={category}
                dateFrom={dateFrom}
                dateTo={dateTo}
                projectId={projectId}
                onSearchChange={setSearch}
                onStatusChange={setStatus}
                onCategoryChange={setCategory}
                onDateFromChange={setDateFrom}
                onDateToChange={setDateTo}
                onProjectIdChange={setProjectId}
                onClearFilters={handleClearFilters}
                hasActiveFilters={hasActiveFilters}
              />

              <ContractListView
                contracts={filteredContracts}
                viewMode={viewMode}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddContract={handleAddNew}
              />
            </div>
          )}
        </motion.div>

        {/* Modal */}
        <ContractFormModal
          open={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) {
              setEditingContract(null);
            }
          }}
          contract={editingContract}
          onSubmit={handleSubmit}
          isLoading={isCreating || isUpdating}
        />
      </div>
    </div>
  );
}
