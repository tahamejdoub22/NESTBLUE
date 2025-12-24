"use client";

import { CostCard } from "./cost-card";
import { CostEmptyState } from "./cost-empty-state";
import { SkeletonCard } from "@/components/atoms";
import type { Cost } from "@/interfaces";
import { cn } from "@/lib/utils";

interface CostListViewProps {
  costs: Cost[];
  isLoading?: boolean;
  onEdit?: (cost: Cost) => void;
  onDelete?: (id: string) => void;
  onAddCost?: () => void;
  viewMode?: "grid" | "list";
}

export function CostListView({
  costs,
  isLoading = false,
  onEdit,
  onDelete,
  onAddCost,
  viewMode = "grid",
}: CostListViewProps) {
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
          <SkeletonCard key={i} className="h-48" />
        ))}
      </div>
    );
  }

  if (costs.length === 0) {
    return <CostEmptyState onAddCost={onAddCost || (() => {})} />;
  }

  return (
    <div
      className={cn(
        "grid gap-4",
        viewMode === "grid"
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1"
      )}
    >
      {costs.map((cost) => (
        <CostCard
          key={cost.id}
          cost={cost}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}



