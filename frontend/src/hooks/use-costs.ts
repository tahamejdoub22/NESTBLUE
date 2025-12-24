"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCostsStore } from "@/core/store/costs-store";
import { costApi } from "@/core/services/api-helpers";
import type { Cost, CreateCostInput, UpdateCostInput } from "@/interfaces";

const COSTS_QUERY_KEY = ["costs"];

export function useCosts() {
  const queryClient = useQueryClient();
  const { costs, setCosts, addCost, updateCost, removeCost } = useCostsStore();

  const costsQuery = useQuery({
    queryKey: COSTS_QUERY_KEY,
    queryFn: async () => {
      const data = await costApi.getAll();
      // Transform amounts to numbers (PostgreSQL decimal returns as string)
      const transformedData = data.map(cost => ({
        ...cost,
        amount: typeof cost.amount === 'string' ? parseFloat(cost.amount) : cost.amount,
        date: cost.date instanceof Date ? cost.date : new Date(cost.date),
      }));
      // Update store with fetched data
      setCosts(transformedData);
      return transformedData;
    },
    // Use store data as placeholder data (shows immediately, but still fetches fresh data)
    // Only use if there's actual data (length > 0) to avoid showing empty state
    placeholderData: costs.length > 0 ? costs : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: true, // Always refetch on mount to ensure fresh data
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateCostInput) => costApi.create(input),
    onSuccess: (newCost) => {
      console.log("Cost created successfully:", newCost);
      // Ensure amount is a number and date is a Date object
      const transformedCost = {
        ...newCost,
        amount: typeof newCost.amount === 'string' ? parseFloat(newCost.amount) : newCost.amount,
        date: newCost.date instanceof Date ? newCost.date : new Date(newCost.date),
      };
      addCost(transformedCost);
      // Invalidate and refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: COSTS_QUERY_KEY });
      queryClient.refetchQueries({ queryKey: COSTS_QUERY_KEY });
    },
    onError: (error) => {
      console.error("Error creating cost:", error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCostInput }) =>
      costApi.update(id, data),
    onSuccess: (updatedCost) => {
      // Ensure amount is a number and date is a Date object
      const transformedCost = {
        ...updatedCost,
        amount:
          typeof updatedCost.amount === "string"
            ? parseFloat(updatedCost.amount)
            : updatedCost.amount,
        date:
          updatedCost.date instanceof Date
            ? updatedCost.date
            : new Date(updatedCost.date),
      };
      updateCost(transformedCost.id, transformedCost);
      // Invalidate and refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: COSTS_QUERY_KEY });
      queryClient.refetchQueries({ queryKey: COSTS_QUERY_KEY });
    },
    onError: (error) => {
      // Log but don't re-throw here; the component awaits mutateAsync and will receive the rejection
      console.error("Error updating cost:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => costApi.delete(id).then(() => id),
    onSuccess: (id) => {
      removeCost(id);
      queryClient.invalidateQueries({ queryKey: COSTS_QUERY_KEY });
    },
  });

  return {
    costs: costsQuery.data || costs,
    isLoading: costsQuery.isLoading,
    error: costsQuery.error,
    createCost: createMutation.mutateAsync,
    updateCost: updateMutation.mutateAsync,
    deleteCost: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

