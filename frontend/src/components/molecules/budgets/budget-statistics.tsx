"use client";

import { StatCard } from "@/components/molecules/stat-card";
import { DollarSign, TrendingUp, Calendar, Target } from "lucide-react";
import { formatCurrency, toNumber } from "@/shared/utils/format";
import type { Budget, Currency } from "@/interfaces";
import { useMemo } from "react";

interface BudgetStatisticsProps {
  budgets: Budget[];
  currency?: Currency;
}

export function BudgetStatistics({ budgets, currency = "USD" }: BudgetStatisticsProps) {
  const stats = useMemo(() => {
    const filteredBudgets = budgets.filter((budget) => budget.currency === currency);

    // Total budget
    const totalBudget = filteredBudgets.reduce((sum, budget) => sum + toNumber(budget.amount), 0);

    // Active budgets (current date within start and end date)
    const now = new Date();
    const activeBudgets = filteredBudgets.filter((budget) => {
      const start = new Date(budget.startDate);
      const end = budget.endDate ? new Date(budget.endDate) : new Date(now.getFullYear() + 1, 11, 31);
      return now >= start && now <= end;
    });

    const activeBudgetTotal = activeBudgets.reduce((sum, budget) => sum + toNumber(budget.amount), 0);

    // Average budget
    const averageBudget =
      filteredBudgets.length > 0 && Number.isFinite(totalBudget)
        ? totalBudget / filteredBudgets.length
        : 0;

    // Total budgets
    const totalBudgets = filteredBudgets.length;

    return {
      totalBudget,
      activeBudgetTotal,
      averageBudget,
      totalBudgets,
    };
  }, [budgets, currency]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Budget"
        value={formatCurrency(stats.totalBudget, currency)}
        icon={DollarSign}
        description={`${stats.totalBudgets} budgets`}
        variant="gradient"
      />
      <StatCard
        title="Active Budget"
        value={formatCurrency(stats.activeBudgetTotal, currency)}
        icon={Target}
        description="Currently active"
      />
      <StatCard
        title="Average Budget"
        value={formatCurrency(stats.averageBudget, currency)}
        icon={TrendingUp}
        description="Per budget"
      />
      <StatCard
        title="Total Budgets"
        value={stats.totalBudgets}
        icon={Calendar}
        description="All time"
        variant="muted"
      />
    </div>
  );
}

