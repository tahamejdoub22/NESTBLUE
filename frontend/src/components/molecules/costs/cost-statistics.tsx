"use client";

import { StatCard } from "@/components/molecules/stat-card";
import { DollarSign, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { formatCurrency, toNumber } from "@/shared/utils/format";
import type { Cost, Currency } from "@/interfaces";
import { useMemo } from "react";

interface CostStatisticsProps {
  costs: Cost[];
  currency?: Currency;
}

export function CostStatistics({ costs, currency = "USD" }: CostStatisticsProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Filter costs by currency
    const filteredCosts = costs.filter((cost) => cost.currency === currency);

    // Total costs
    const totalCosts = filteredCosts.reduce((sum, cost) => sum + toNumber(cost.amount), 0);

    // Current month costs
    const currentMonthCosts = filteredCosts
      .filter(
        (cost) =>
          new Date(cost.date).getMonth() === currentMonth &&
          new Date(cost.date).getFullYear() === currentYear
      )
      .reduce((sum, cost) => sum + toNumber(cost.amount), 0);

    // Last month costs
    const lastMonthCosts = filteredCosts
      .filter(
        (cost) =>
          new Date(cost.date).getMonth() === lastMonth &&
          new Date(cost.date).getFullYear() === lastMonthYear
      )
      .reduce((sum, cost) => sum + toNumber(cost.amount), 0);

    // Calculate month-over-month change
    const monthlyChange =
      lastMonthCosts > 0
        ? ((currentMonthCosts - lastMonthCosts) / lastMonthCosts) * 100
        : 0;

    // Average cost per transaction
    const averageCost =
      filteredCosts.length > 0 ? totalCosts / filteredCosts.length : 0;

    // Total transactions
    const totalTransactions = filteredCosts.length;

    return {
      totalCosts,
      currentMonthCosts,
      monthlyChange,
      averageCost,
      totalTransactions,
    };
  }, [costs, currency]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Costs"
        value={formatCurrency(stats.totalCosts, currency)}
        icon={DollarSign}
        description={`${stats.totalTransactions} transactions`}
        variant="gradient"
      />
      <StatCard
        title="This Month"
        value={formatCurrency(stats.currentMonthCosts, currency)}
        change={{
          value: Math.abs(stats.monthlyChange),
          trend: stats.monthlyChange >= 0 ? "up" : "down",
        }}
        icon={Calendar}
        description="Current month spending"
      />
      <StatCard
        title="Average Cost"
        value={formatCurrency(stats.averageCost, currency)}
        icon={TrendingUp}
        description="Per transaction"
      />
      <StatCard
        title="Total Transactions"
        value={stats.totalTransactions}
        icon={TrendingDown}
        description="All time"
        variant="muted"
      />
    </div>
  );
}



