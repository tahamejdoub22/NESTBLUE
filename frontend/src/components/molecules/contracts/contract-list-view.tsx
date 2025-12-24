"use client";

import { ContractCard } from "./contract-card";
import { ContractEmptyState } from "./contract-empty-state";
import { SkeletonCard } from "@/components/atoms";
import type { Contract } from "@/interfaces";
import { cn } from "@/lib/utils";

interface ContractListViewProps {
  contracts: Contract[];
  isLoading?: boolean;
  onEdit?: (contract: Contract) => void;
  onDelete?: (id: string) => void;
  onAddContract?: () => void;
  viewMode?: "grid" | "list";
}

export function ContractListView({
  contracts,
  isLoading = false,
  onEdit,
  onDelete,
  onAddContract,
  viewMode = "grid",
}: ContractListViewProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "grid gap-4",
          viewMode === "grid"
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1"
        )}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} className="h-64" />
        ))}
      </div>
    );
  }

  if (contracts.length === 0) {
    return <ContractEmptyState onAddContract={onAddContract || (() => {})} />;
  }

  return (
    <div
      className={cn(
        "grid gap-2",
        viewMode === "grid"
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1"
      )}
    >
      {contracts.map((contract, index) => (
        <ContractCard
          key={contract.id}
          contract={contract}
          onEdit={onEdit}
          onDelete={onDelete}
          delay={index * 0.05}
        />
      ))}
    </div>
  );
}

