import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import type { Budget, CostCategory } from "@/interfaces";

interface BudgetsFilters {
  category?: CostCategory;
  period?: "daily" | "weekly" | "monthly" | "yearly";
  search?: string;
}

interface BudgetsState {
  budgets: Budget[];
  filters: BudgetsFilters;
  isLoading: boolean;
  error: string | null;
}

interface BudgetsActions {
  setBudgets: (budgets: Budget[]) => void;
  addBudget: (budget: Budget) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  removeBudget: (id: string) => void;
  setFilters: (filters: Partial<BudgetsFilters>) => void;
  clearFilters: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const initialState: BudgetsState = {
  budgets: [],
  filters: {},
  isLoading: false,
  error: null,
};

export const useBudgetsStore = create<BudgetsState & BudgetsActions>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setBudgets: (budgets) => set({ budgets }, false, "setBudgets"),

        addBudget: (budget) =>
          set(
            (state) => ({ budgets: [budget, ...state.budgets] }),
            false,
            "addBudget"
          ),

        updateBudget: (id, updates) =>
          set(
            (state) => ({
              budgets: state.budgets.map((budget) =>
                budget.id === id ? { ...budget, ...updates } : budget
              ),
            }),
            false,
            "updateBudget"
          ),

        removeBudget: (id) =>
          set(
            (state) => ({
              budgets: state.budgets.filter((budget) => budget.id !== id),
            }),
            false,
            "removeBudget"
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
        name: "budgets-storage",
        partialize: (state) => ({ budgets: state.budgets }),
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
    { name: "BudgetsStore" }
  )
);



