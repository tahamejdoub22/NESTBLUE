"use client";

import { ExpenseCard } from "./expense-card";
import { ExpenseEmptyState } from "./expense-empty-state";
import { SkeletonCard } from "@/components/atoms";
import type { Expense } from "@/interfaces";
import { cn } from "@/lib/utils";

export interface ExpenseListViewProps {
  expenses: Expense[];
  isLoading?: boolean;
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
  onAddExpense?: () => void;
  viewMode?: "grid" | "list";
}

export function ExpenseListView({
  expenses,
  isLoading = false,
  onEdit,
  onDelete,
  onAddExpense,
  viewMode = "grid",
}: ExpenseListViewProps) {
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

  if (expenses.length === 0) {
    return <ExpenseEmptyState onAddExpense={onAddExpense || (() => {})} />;
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
      {expenses.map((expense) => (
        <ExpenseCard
          key={expense.id}
          expense={expense}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

