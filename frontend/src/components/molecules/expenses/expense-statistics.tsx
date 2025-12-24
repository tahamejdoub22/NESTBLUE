"use client";

import { StatCard } from "@/components/molecules/stat-card";
import { DollarSign, TrendingUp, Repeat, Activity } from "lucide-react";
import { formatCurrency, toNumber } from "@/shared/utils/format";
import type { Expense, Currency } from "@/interfaces";
import { useMemo } from "react";

interface ExpenseStatisticsProps {
  expenses: Expense[];
  currency?: Currency;
}

export function ExpenseStatistics({ expenses, currency = "USD" }: ExpenseStatisticsProps) {
  const stats = useMemo(() => {
    const filteredExpenses = expenses.filter((expense) => expense.currency === currency);
    const activeExpenses = filteredExpenses.filter((exp) => exp.isActive);

    // Calculate monthly total (projected) - only for active expenses
    const monthlyTotal = activeExpenses.reduce((sum, expense) => {
      let multiplier = 0;
      switch (expense.frequency) {
        case "daily":
          multiplier = 30;
          break;
        case "weekly":
          multiplier = 4.33;
          break;
        case "monthly":
          multiplier = 1;
          break;
        case "yearly":
          multiplier = 1 / 12;
          break;
        case "one-time":
          multiplier = 0;
          break;
      }
      return sum + toNumber(expense.amount) * multiplier;
    }, 0);

    // Total expenses
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + toNumber(expense.amount), 0);

    // Average expense
    const averageExpense =
      filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0;

    // Active count
    const activeCount = activeExpenses.length;

    return {
      monthlyTotal,
      totalExpenses,
      averageExpense,
      activeCount,
    };
  }, [expenses, currency]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Monthly Projected"
        value={formatCurrency(stats.monthlyTotal, currency)}
        icon={DollarSign}
        description="Projected monthly expenses"
        variant="gradient"
      />
      <StatCard
        title="Total Expenses"
        value={formatCurrency(stats.totalExpenses, currency)}
        icon={TrendingUp}
        description={`${expenses.length} expenses`}
      />
      <StatCard
        title="Average Expense"
        value={formatCurrency(stats.averageExpense, currency)}
        icon={Repeat}
        description="Per expense"
      />
      <StatCard
        title="Active Expenses"
        value={stats.activeCount}
        icon={Activity}
        description="Currently active"
        variant="muted"
      />
    </div>
  );
}

