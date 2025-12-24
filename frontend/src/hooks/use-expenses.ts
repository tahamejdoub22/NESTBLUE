"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useExpensesStore } from "@/core/store/expenses-store";
import { expenseApi } from "@/core/services/api-helpers";
import type { Expense, CreateExpenseInput, UpdateExpenseInput } from "@/interfaces";

const EXPENSES_QUERY_KEY = ["expenses"];

export function useExpenses() {
  const queryClient = useQueryClient();
  const { expenses, setExpenses, addExpense, updateExpense, removeExpense } = useExpensesStore();

  const expensesQuery = useQuery({
    queryKey: EXPENSES_QUERY_KEY,
    queryFn: async () => {
      const data = await expenseApi.getAll();
      // Update store with fetched data
      setExpenses(data);
      return data;
    },
    // Use store data as placeholder data (shows immediately, but still fetches fresh data)
    // Only use if there's actual data (length > 0) to avoid showing empty state
    placeholderData: expenses.length > 0 ? expenses : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: true, // Always refetch on mount to ensure fresh data
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateExpenseInput) => expenseApi.create(input),
    onSuccess: (newExpense) => {
      addExpense(newExpense);
      queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseInput }) =>
      expenseApi.update(id, data),
    onSuccess: (updatedExpense) => {
      updateExpense(updatedExpense.id, updatedExpense);
      queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => expenseApi.delete(id).then(() => id),
    onSuccess: (id) => {
      removeExpense(id);
      queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
    },
  });

  return {
    expenses: expensesQuery.data || expenses,
    isLoading: expensesQuery.isLoading,
    error: expensesQuery.error,
    createExpense: createMutation.mutateAsync,
    updateExpense: updateMutation.mutateAsync,
    deleteExpense: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

