"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useContractsStore } from "@/core/store/contracts-store";
import { contractApi } from "@/core/services/api-helpers";
import type { Contract, CreateContractInput, UpdateContractInput } from "@/interfaces";

const CONTRACTS_QUERY_KEY = ["contracts"];

export function useContracts() {
  const queryClient = useQueryClient();
  const { contracts, setContracts, addContract, updateContract, removeContract } = useContractsStore();

  const contractsQuery = useQuery({
    queryKey: CONTRACTS_QUERY_KEY,
    queryFn: async () => {
      const data = await contractApi.getAll();
      // Normalize: decimal amount (string) -> number, dates -> Date
      const transformed = data.map((contract) => ({
        ...contract,
        amount:
          typeof contract.amount === "string"
            ? parseFloat(contract.amount)
            : contract.amount,
        startDate:
          contract.startDate instanceof Date
            ? contract.startDate
            : new Date(contract.startDate),
        endDate:
          contract.endDate instanceof Date || contract.endDate == null
            ? contract.endDate
            : new Date(contract.endDate),
        renewalDate:
          contract.renewalDate instanceof Date || contract.renewalDate == null
            ? contract.renewalDate
            : new Date(contract.renewalDate),
      }));
      // Update store with fetched data
      setContracts(transformed);
      return transformed;
    },
    // Use store data as placeholder data (shows immediately, but still fetches fresh data)
    placeholderData: contracts.length > 0 ? contracts : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: true, // Always refetch on mount to ensure fresh data
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateContractInput) => contractApi.create(input),
    onSuccess: (newContract) => {
      const transformed = {
        ...newContract,
        amount:
          typeof newContract.amount === "string"
            ? parseFloat(newContract.amount)
            : newContract.amount,
        startDate:
          newContract.startDate instanceof Date
            ? newContract.startDate
            : new Date(newContract.startDate),
        endDate:
          newContract.endDate instanceof Date || newContract.endDate == null
            ? newContract.endDate
            : new Date(newContract.endDate),
        renewalDate:
          newContract.renewalDate instanceof Date || newContract.renewalDate == null
            ? newContract.renewalDate
            : new Date(newContract.renewalDate),
      };
      addContract(transformed);
      queryClient.invalidateQueries({ queryKey: CONTRACTS_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateContractInput }) =>
      contractApi.update(id, data),
    onSuccess: (updatedContract) => {
      const transformed = {
        ...updatedContract,
        amount:
          typeof updatedContract.amount === "string"
            ? parseFloat(updatedContract.amount)
            : updatedContract.amount,
        startDate:
          updatedContract.startDate instanceof Date
            ? updatedContract.startDate
            : new Date(updatedContract.startDate),
        endDate:
          updatedContract.endDate instanceof Date || updatedContract.endDate == null
            ? updatedContract.endDate
            : new Date(updatedContract.endDate),
        renewalDate:
          updatedContract.renewalDate instanceof Date || updatedContract.renewalDate == null
            ? updatedContract.renewalDate
            : new Date(updatedContract.renewalDate),
      };
      updateContract(transformed.id, transformed);
      queryClient.invalidateQueries({ queryKey: CONTRACTS_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contractApi.delete(id).then(() => id),
    onSuccess: (id) => {
      removeContract(id);
      queryClient.invalidateQueries({ queryKey: CONTRACTS_QUERY_KEY });
    },
  });

  return {
    contracts: contractsQuery.data || contracts,
    isLoading: contractsQuery.isLoading,
    error: contractsQuery.error,
    createContract: createMutation.mutateAsync,
    updateContract: updateMutation.mutateAsync,
    deleteContract: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

