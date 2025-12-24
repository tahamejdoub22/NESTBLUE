import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import type { Cost, CostCategory } from "@/interfaces";

interface CostsFilters {
  category?: CostCategory;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

interface CostsState {
  costs: Cost[];
  filters: CostsFilters;
  isLoading: boolean;
  error: string | null;
}

interface CostsActions {
  setCosts: (costs: Cost[]) => void;
  addCost: (cost: Cost) => void;
  updateCost: (id: string, updates: Partial<Cost>) => void;
  removeCost: (id: string) => void;
  setFilters: (filters: Partial<CostsFilters>) => void;
  clearFilters: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const initialState: CostsState = {
  costs: [],
  filters: {},
  isLoading: false,
  error: null,
};

export const useCostsStore = create<CostsState & CostsActions>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setCosts: (costs) => set({ costs }, false, "setCosts"),

        addCost: (cost) =>
          set(
            (state) => ({ costs: [cost, ...state.costs] }),
            false,
            "addCost"
          ),

        updateCost: (id, updates) =>
          set(
            (state) => ({
              costs: state.costs.map((cost) =>
                cost.id === id ? { ...cost, ...updates } : cost
              ),
            }),
            false,
            "updateCost"
          ),

        removeCost: (id) =>
          set(
            (state) => ({
              costs: state.costs.filter((cost) => cost.id !== id),
            }),
            false,
            "removeCost"
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
        name: "costs-storage",
        partialize: (state) => ({ costs: state.costs }),
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
    { name: "CostsStore" }
  )
);



