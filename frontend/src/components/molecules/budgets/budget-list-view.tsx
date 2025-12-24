"use client";

import { BudgetCard } from "./budget-card";
import { BudgetEmptyState } from "./budget-empty-state";
import { SkeletonCard } from "@/components/atoms";
import type { Budget } from "@/interfaces";
import { cn } from "@/lib/utils";

interface BudgetListViewProps {
  budgets: Budget[];
  isLoading?: boolean;
  onEdit?: (budget: Budget) => void;
  onDelete?: (id: string) => void;
  onAddBudget?: () => void;
  viewMode?: "grid" | "list";
}

export function BudgetListView({
  budgets,
  isLoading = false,
  onEdit,
  onDelete,
  onAddBudget,
  viewMode = "grid",
}: BudgetListViewProps) {
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

  if (budgets.length === 0) {
    return <BudgetEmptyState onAddBudget={onAddBudget || (() => {})} />;
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
      {budgets.map((budget) => (
        <BudgetCard
          key={budget.id}
          budget={budget}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

