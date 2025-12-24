import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import type { Contract, ContractStatus } from "@/interfaces";

interface ContractsFilters {
  status?: ContractStatus;
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  projectId?: string;
}

interface ContractsState {
  contracts: Contract[];
  filters: ContractsFilters;
  isLoading: boolean;
  error: string | null;
}

interface ContractsActions {
  setContracts: (contracts: Contract[]) => void;
  addContract: (contract: Contract) => void;
  updateContract: (id: string, updates: Partial<Contract>) => void;
  removeContract: (id: string) => void;
  setFilters: (filters: Partial<ContractsFilters>) => void;
  clearFilters: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const initialState: ContractsState = {
  contracts: [],
  filters: {},
  isLoading: false,
  error: null,
};

export const useContractsStore = create<ContractsState & ContractsActions>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setContracts: (contracts) => set({ contracts }, false, "setContracts"),

        addContract: (contract) =>
          set(
            (state) => ({ contracts: [contract, ...state.contracts] }),
            false,
            "addContract"
          ),

        updateContract: (id, updates) =>
          set(
            (state) => ({
              contracts: state.contracts.map((contract) =>
                contract.id === id ? { ...contract, ...updates } : contract
              ),
            }),
            false,
            "updateContract"
          ),

        removeContract: (id) =>
          set(
            (state) => ({
              contracts: state.contracts.filter((contract) => contract.id !== id),
            }),
            false,
            "removeContract"
          ),

        setFilters: (filters) =>
          set(
            (state) => ({ filters: { ...state.filters, ...filters } }),
            false,
            "setFilters"
          ),

        clearFilters: () => set({ filters: {} }, false, "clearFilters"),

        setLoading: (isLoading) => set({ isLoading }, false, "setLoading"),

        setError: (error) => set({ error }, false, "setError"),
      }),
      {
        name: "contracts-storage",
        partialize: (state) => ({ contracts: state.contracts }),
        storage: createJSONStorage(() => {
          if (typeof window !== "undefined") {
            return localStorage;
          }
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }),
      }
    ),
    { name: "ContractsStore" }
  )
);



