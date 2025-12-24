"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { Tabs } from "@/components/molecules/tabs";
import { Plus, Grid3x3, List, Download, DollarSign, Target, Receipt } from "lucide-react";
import { CostFilters } from "@/components/molecules/costs/cost-filters";
import { CostFormModal } from "@/components/molecules/costs/cost-form-modal";
import { CostListView } from "@/components/molecules/costs/cost-list-view";
import { BudgetFilters } from "@/components/molecules/budgets/budget-filters";
import { BudgetFormModal } from "@/components/molecules/budgets/budget-form-modal";
import { BudgetListView } from "@/components/molecules/budgets/budget-list-view";
import { ExpenseFilters } from "@/components/molecules/expenses/expense-filters";
import { ExpenseFormModal } from "@/components/molecules/expenses/expense-form-modal";
import { ExpenseListView } from "@/components/molecules/expenses/expense-list-view";
import { useCosts } from "@/hooks/use-costs";
import { useExpenses } from "@/hooks/use-expenses";
import { useBudgets } from "@/hooks/use-budgets";
import { useProjects } from "@/hooks/use-projects";
import type { CostFormData } from "@/core/schemas/cost-schema";
import type { BudgetFormData } from "@/core/schemas/budget-schema";
import type { ExpenseFormData } from "@/core/schemas/expense-schema";
import type { Cost, Budget, Expense, CostCategory } from "@/interfaces";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/atoms/loading-screen";
import { fadeInUp, transitions } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/shared/utils/format";

export default function CostsPage() {
  const [activeTab, setActiveTab] = useState<"costs" | "budgets" | "expenses">("costs");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Costs state
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<Cost | null>(null);
  const [costSearch, setCostSearch] = useState("");
  const [costCategory, setCostCategory] = useState<CostCategory | undefined>();
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [costProjectId, setCostProjectId] = useState<string | undefined>();

  // Budgets state
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [budgetSearch, setBudgetSearch] = useState("");
  const [budgetCategory, setBudgetCategory] = useState<CostCategory | undefined>();
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly" | undefined>();
  const [budgetProjectId, setBudgetProjectId] = useState<string | undefined>();

  // Expenses state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenseSearch, setExpenseSearch] = useState("");
  const [expenseCategory, setExpenseCategory] = useState<CostCategory | undefined>();
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly" | "yearly" | "one-time" | undefined>();
  const [isActive, setIsActive] = useState<boolean | undefined>();
  const [expenseProjectId, setExpenseProjectId] = useState<string | undefined>();

  // Fetch data
  const { costs, isLoading: isLoadingCosts, createCost, updateCost, deleteCost, isCreating: isCreatingCost, isUpdating: isUpdatingCost } = useCosts();
  const { budgets, isLoading: isLoadingBudgets, createBudget, updateBudget, deleteBudget, isCreating: isCreatingBudget, isUpdating: isUpdatingBudget } = useBudgets();
  const { expenses, isLoading: isLoadingExpenses, createExpense, updateExpense, deleteExpense, isCreating: isCreatingExpense, isUpdating: isUpdatingExpense } = useExpenses();
  const { projects } = useProjects();

  const isLoading = isLoadingCosts || isLoadingBudgets || isLoadingExpenses;

  // Filter costs
  const filteredCosts = useMemo(() => {
    let filtered = [...costs];
    if (costSearch.trim()) {
      const searchLower = costSearch.toLowerCase();
      filtered = filtered.filter(
        (cost) =>
          cost.name.toLowerCase().includes(searchLower) ||
          cost.description?.toLowerCase().includes(searchLower) ||
          cost.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }
    if (costCategory) {
      filtered = filtered.filter((cost) => cost.category === costCategory);
    }
    if (dateFrom) {
      filtered = filtered.filter((cost) => new Date(cost.date) >= dateFrom);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((cost) => new Date(cost.date) <= toDate);
    }
    if (costProjectId) {
      if (costProjectId === "unassigned") {
        filtered = filtered.filter((cost) => !cost.projectId);
      } else {
        filtered = filtered.filter((cost) => cost.projectId === costProjectId);
      }
    }
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [costs, costSearch, costCategory, dateFrom, dateTo, costProjectId]);

  // Filter budgets
  const filteredBudgets = useMemo(() => {
    let filtered = [...budgets];
    if (budgetSearch.trim()) {
      const searchLower = budgetSearch.toLowerCase();
      filtered = filtered.filter((budget) => budget.name.toLowerCase().includes(searchLower));
    }
    if (budgetCategory) {
      filtered = filtered.filter((budget) => budget.category === budgetCategory);
    }
    if (period) {
      filtered = filtered.filter((budget) => budget.period === period);
    }
    if (budgetProjectId) {
      if (budgetProjectId === "unassigned") {
        filtered = filtered.filter((budget) => !budget.projectId);
      } else {
        filtered = filtered.filter((budget) => budget.projectId === budgetProjectId);
      }
    }
    return filtered.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [budgets, budgetSearch, budgetCategory, period, budgetProjectId]);

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];
    if (expenseSearch.trim()) {
      const searchLower = expenseSearch.toLowerCase();
      filtered = filtered.filter(
        (expense) =>
          expense.name.toLowerCase().includes(searchLower) ||
          expense.description?.toLowerCase().includes(searchLower)
      );
    }
    if (expenseCategory) {
      filtered = filtered.filter((expense) => expense.category === expenseCategory);
    }
    if (frequency) {
      filtered = filtered.filter((expense) => expense.frequency === frequency);
    }
    if (isActive !== undefined) {
      filtered = filtered.filter((expense) => expense.isActive === isActive);
    }
    if (expenseProjectId) {
      if (expenseProjectId === "unassigned") {
        filtered = filtered.filter((expense) => !expense.projectId);
      } else {
        filtered = filtered.filter((expense) => expense.projectId === expenseProjectId);
      }
    }
    return filtered.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [expenses, expenseSearch, expenseCategory, frequency, isActive, expenseProjectId]);

  // Check active filters
  const hasActiveCostFilters = useMemo(() => {
    return !!(costSearch || costCategory || dateFrom || dateTo || costProjectId);
  }, [costSearch, costCategory, dateFrom, dateTo, costProjectId]);

  const hasActiveBudgetFilters = useMemo(() => {
    return !!(budgetSearch || budgetCategory || period || budgetProjectId);
  }, [budgetSearch, budgetCategory, period, budgetProjectId]);

  const hasActiveExpenseFilters = useMemo(() => {
    return !!(expenseSearch || expenseCategory || frequency || isActive !== undefined || expenseProjectId);
  }, [expenseSearch, expenseCategory, frequency, isActive, expenseProjectId]);

  // Cost handlers
  const handleCostSubmit = async (data: CostFormData) => {
    try {
      if (editingCost) {
        await updateCost({ id: editingCost.id, data });
        toast.success("Cost updated successfully");
        setIsCostModalOpen(false);
        setEditingCost(null);
      } else {
        await createCost(data);
        toast.success("Cost added successfully");
        setIsCostModalOpen(false);
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.response?.data?.message || "An error occurred";
      toast.error(errorMessage);
    }
  };

  const handleCostDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this cost?")) {
      try {
        await deleteCost(id);
        toast.success("Cost deleted successfully");
      } catch (error) {
        toast.error("Failed to delete cost");
      }
    }
  };

  const handleCostEdit = (cost: Cost) => {
    setEditingCost(cost);
    setIsCostModalOpen(true);
  };

  const handleClearCostFilters = () => {
    setCostSearch("");
    setCostCategory(undefined);
    setDateFrom(undefined);
    setDateTo(undefined);
    setCostProjectId(undefined);
  };

  // Budget handlers
  const handleBudgetSubmit = async (data: BudgetFormData) => {
    try {
      if (editingBudget) {
        await updateBudget({ id: editingBudget.id, data });
        toast.success("Budget updated successfully");
        setIsBudgetModalOpen(false);
        setEditingBudget(null);
      } else {
        await createBudget(data);
        toast.success("Budget created successfully");
        setIsBudgetModalOpen(false);
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleBudgetDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this budget?")) {
      try {
        await deleteBudget(id);
        toast.success("Budget deleted successfully");
      } catch (error) {
        toast.error("Failed to delete budget");
      }
    }
  };

  const handleBudgetEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setIsBudgetModalOpen(true);
  };

  const handleClearBudgetFilters = () => {
    setBudgetSearch("");
    setBudgetCategory(undefined);
    setPeriod(undefined);
    setBudgetProjectId(undefined);
  };

  // Expense handlers
  const handleExpenseSubmit = async (data: ExpenseFormData) => {
    try {
      if (editingExpense) {
        await updateExpense({ id: editingExpense.id, data });
        toast.success("Expense updated successfully");
        setIsExpenseModalOpen(false);
        setEditingExpense(null);
      } else {
        await createExpense(data);
        toast.success("Expense created successfully");
        setIsExpenseModalOpen(false);
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleExpenseDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpense(id);
        toast.success("Expense deleted successfully");
      } catch (error) {
        toast.error("Failed to delete expense");
      }
    }
  };

  const handleExpenseEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const handleClearExpenseFilters = () => {
    setExpenseSearch("");
    setExpenseCategory(undefined);
    setFrequency(undefined);
    setIsActive(undefined);
    setExpenseProjectId(undefined);
  };

  // Get current tab's add button handler
  const getAddButtonHandler = () => {
    if (activeTab === "costs") {
      return () => {
        setEditingCost(null);
        setIsCostModalOpen(true);
      };
    } else if (activeTab === "budgets") {
      return () => {
        setEditingBudget(null);
        setIsBudgetModalOpen(true);
      };
    } else {
      return () => {
        setEditingExpense(null);
        setIsExpenseModalOpen(true);
      };
    }
  };

  // Get current tab's item count
  const getItemCount = () => {
    if (activeTab === "costs") return filteredCosts.length;
    if (activeTab === "budgets") return filteredBudgets.length;
    return filteredExpenses.length;
  };

  if (isLoading) {
    return <LoadingScreen type="dashboard" />;
  }

  return (
    <div className="space-y-6 bg-[#F7F9FC] dark:bg-background min-h-screen p-6">
      <div className="max-w-[1920px] mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-1">
              Financial Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage costs, budgets, and expenses in one place
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 border border-border/40 rounded-lg p-1 bg-card">
              <Button
                variant={viewMode === "grid" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 px-2"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 px-2"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={getAddButtonHandler()}
              className="h-8 px-3 gap-2"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm">
                Add {activeTab === "costs" ? "Cost" : activeTab === "budgets" ? "Budget" : "Expense"}
              </span>
            </Button>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "costs" | "budgets" | "expenses")}
            items={[
              {
                value: "costs",
                label: `Costs${costs.length > 0 ? ` (${costs.length})` : ""}`,
                icon: <DollarSign className="h-4 w-4" />,
              },
              {
                value: "budgets",
                label: `Budgets${budgets.length > 0 ? ` (${budgets.length})` : ""}`,
                icon: <Target className="h-4 w-4" />,
              },
              {
                value: "expenses",
                label: `Expenses${expenses.length > 0 ? ` (${expenses.length})` : ""}`,
                icon: <Receipt className="h-4 w-4" />,
              },
            ]}
          />
        </motion.div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-2"
        >
          {/* Costs Tab */}
          {activeTab === "costs" && (
            <>
              <CostFilters
                search={costSearch}
                category={costCategory}
                dateFrom={dateFrom}
                dateTo={dateTo}
                projectId={costProjectId}
                onSearchChange={setCostSearch}
                onCategoryChange={setCostCategory}
                onDateFromChange={setDateFrom}
                onDateToChange={setDateTo}
                onProjectChange={setCostProjectId}
                onClearFilters={handleClearCostFilters}
                hasActiveFilters={hasActiveCostFilters}
              />
              <CostListView
                costs={filteredCosts}
                viewMode={viewMode}
                isLoading={isLoadingCosts}
                onEdit={handleCostEdit}
                onDelete={handleCostDelete}
                onAddCost={() => {
                  setEditingCost(null);
                  setIsCostModalOpen(true);
                }}
              />
            </>
          )}

          {/* Budgets Tab */}
          {activeTab === "budgets" && (
            <>
              <BudgetFilters
                search={budgetSearch}
                category={budgetCategory}
                period={period}
                projectId={budgetProjectId}
                onSearchChange={setBudgetSearch}
                onCategoryChange={setBudgetCategory}
                onPeriodChange={setPeriod}
                onProjectChange={setBudgetProjectId}
                onClearFilters={handleClearBudgetFilters}
                hasActiveFilters={hasActiveBudgetFilters}
              />
              <BudgetListView
                budgets={filteredBudgets}
                viewMode={viewMode}
                isLoading={isLoadingBudgets}
                onEdit={handleBudgetEdit}
                onDelete={handleBudgetDelete}
              />
            </>
          )}

          {/* Expenses Tab */}
          {activeTab === "expenses" && (
            <>
              <ExpenseFilters
                search={expenseSearch}
                category={expenseCategory}
                frequency={frequency}
                isActive={isActive}
                projectId={expenseProjectId}
                onSearchChange={setExpenseSearch}
                onCategoryChange={setExpenseCategory}
                onFrequencyChange={setFrequency}
                onIsActiveChange={setIsActive}
                onProjectIdChange={setExpenseProjectId}
                onClearFilters={handleClearExpenseFilters}
                hasActiveFilters={hasActiveExpenseFilters}
              />
              <ExpenseListView
                expenses={filteredExpenses}
                viewMode={viewMode}
                isLoading={isLoadingExpenses}
                onEdit={handleExpenseEdit}
                onDelete={handleExpenseDelete}
              />
            </>
          )}
        </motion.div>

        {/* Modals */}
        <CostFormModal
          open={isCostModalOpen}
          onOpenChange={(open) => {
            setIsCostModalOpen(open);
            if (!open) {
              setEditingCost(null);
            }
          }}
          cost={editingCost}
          onSubmit={handleCostSubmit}
          isLoading={isCreatingCost || isUpdatingCost}
        />

        <BudgetFormModal
          open={isBudgetModalOpen}
          onOpenChange={(open) => {
            setIsBudgetModalOpen(open);
            if (!open) {
              setEditingBudget(null);
            }
          }}
          budget={editingBudget}
          onSubmit={handleBudgetSubmit}
          isLoading={isCreatingBudget || isUpdatingBudget}
        />

        <ExpenseFormModal
          open={isExpenseModalOpen}
          onOpenChange={(open) => {
            setIsExpenseModalOpen(open);
            if (!open) {
              setEditingExpense(null);
            }
          }}
          expense={editingExpense}
          onSubmit={handleExpenseSubmit}
          isLoading={isCreatingExpense || isUpdatingExpense}
        />
      </div>
    </div>
  );
}
