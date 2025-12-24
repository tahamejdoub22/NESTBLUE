"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useBudgetsStore } from "@/core/store/budgets-store";
import { budgetApi } from "@/core/services/api-helpers";
import type { Budget, CreateBudgetInput, UpdateBudgetInput } from "@/interfaces";

const BUDGETS_QUERY_KEY = ["budgets"];

export function useBudgets() {
  const queryClient = useQueryClient();
  const { budgets, setBudgets, addBudget, updateBudget, removeBudget } = useBudgetsStore();

  const budgetsQuery = useQuery({
    queryKey: BUDGETS_QUERY_KEY,
    queryFn: async () => {
      const data = await budgetApi.getAll();
      // Normalize data: ensure amount is number and dates are Date objects
      const transformed = data.map((budget) => ({
        ...budget,
        amount:
          typeof budget.amount === "string"
            ? parseFloat(budget.amount)
            : budget.amount,
        startDate:
          budget.startDate instanceof Date
            ? budget.startDate
            : new Date(budget.startDate),
        endDate:
          budget.endDate instanceof Date || budget.endDate === undefined || budget.endDate === null
            ? budget.endDate
            : new Date(budget.endDate),
      }));
      // Update store with fetched data
      setBudgets(transformed);
      return transformed;
    },
    // Use store data as placeholder data (shows immediately, but still fetches fresh data)
    // Only use if there's actual data (length > 0) to avoid showing empty state
    placeholderData: budgets.length > 0 ? budgets : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: true, // Always refetch on mount to ensure fresh data
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateBudgetInput) => budgetApi.create(input),
    onSuccess: (newBudget) => {
      const transformed = {
        ...newBudget,
        amount:
          typeof newBudget.amount === "string"
            ? parseFloat(newBudget.amount)
            : newBudget.amount,
        startDate:
          newBudget.startDate instanceof Date
            ? newBudget.startDate
            : new Date(newBudget.startDate),
        endDate:
          newBudget.endDate instanceof Date || newBudget.endDate === undefined || newBudget.endDate === null
            ? newBudget.endDate
            : new Date(newBudget.endDate),
      };
      addBudget(transformed);
      queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBudgetInput }) =>
      budgetApi.update(id, data),
    onSuccess: (updatedBudget) => {
      const transformed = {
        ...updatedBudget,
        amount:
          typeof updatedBudget.amount === "string"
            ? parseFloat(updatedBudget.amount)
            : updatedBudget.amount,
        startDate:
          updatedBudget.startDate instanceof Date
            ? updatedBudget.startDate
            : new Date(updatedBudget.startDate),
        endDate:
          updatedBudget.endDate instanceof Date || updatedBudget.endDate === undefined || updatedBudget.endDate === null
            ? updatedBudget.endDate
            : new Date(updatedBudget.endDate),
      };
      updateBudget(transformed.id, transformed);
      queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => budgetApi.delete(id).then(() => id),
    onSuccess: (id) => {
      removeBudget(id);
      queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY });
    },
  });

  return {
    budgets: budgetsQuery.data || budgets,
    isLoading: budgetsQuery.isLoading,
    error: budgetsQuery.error,
    createBudget: createMutation.mutateAsync,
    updateBudget: updateMutation.mutateAsync,
    deleteBudget: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

