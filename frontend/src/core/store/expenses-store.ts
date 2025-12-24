import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import type { Expense, CostCategory } from "@/interfaces";

interface ExpensesFilters {
  category?: CostCategory;
  frequency?: "daily" | "weekly" | "monthly" | "yearly" | "one-time";
  isActive?: boolean;
  search?: string;
}

interface ExpensesState {
  expenses: Expense[];
  filters: ExpensesFilters;
  isLoading: boolean;
  error: string | null;
}

interface ExpensesActions {
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  removeExpense: (id: string) => void;
  setFilters: (filters: Partial<ExpensesFilters>) => void;
  clearFilters: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

const initialState: ExpensesState = {
  expenses: [],
  filters: {},
  isLoading: false,
  error: null,
};

export const useExpensesStore = create<ExpensesState & ExpensesActions>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        setExpenses: (expenses) => set({ expenses }, false, "setExpenses"),

        addExpense: (expense) =>
          set(
            (state) => ({ expenses: [expense, ...state.expenses] }),
            false,
            "addExpense"
          ),

        updateExpense: (id, updates) =>
          set(
            (state) => ({
              expenses: state.expenses.map((expense) =>
                expense.id === id ? { ...expense, ...updates } : expense
              ),
            }),
            false,
            "updateExpense"
          ),

        removeExpense: (id) =>
          set(
            (state) => ({
              expenses: state.expenses.filter((expense) => expense.id !== id),
            }),
            false,
            "removeExpense"
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
        name: "expenses-storage",
        partialize: (state) => ({ expenses: state.expenses }),
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
    { name: "ExpensesStore" }
  )
);



