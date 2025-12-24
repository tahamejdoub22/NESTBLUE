"use client";

import { StatCard } from "@/components/molecules/stat-card";
import { DollarSign, FileText, AlertCircle, Calendar } from "lucide-react";
import { formatCurrency, toNumber } from "@/shared/utils/format";
import type { Contract, Currency } from "@/interfaces";
import { useMemo } from "react";

interface ContractStatisticsProps {
  contracts: Contract[];
  currency?: Currency;
}

export function ContractStatistics({ contracts, currency = "USD" }: ContractStatisticsProps) {
  const stats = useMemo(() => {
    // Filter contracts by currency
    const filteredContracts = contracts.filter((contract) => contract.currency === currency);

    // Total contract value
    const totalValue = filteredContracts.reduce((sum, contract) => sum + toNumber(contract.amount), 0);

    // Active contracts
    const activeContracts = filteredContracts.filter((c) => c.status === "active");

    // Expiring soon (within 30 days)
    const now = new Date();
    const thirtyDaysFromNow = new Date(now);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const expiringSoon = filteredContracts.filter((contract) => {
      if (!contract.endDate || contract.status !== "active") return false;
      const endDate = new Date(contract.endDate);
      return endDate >= now && endDate <= thirtyDaysFromNow;
    });

    // Pending renewal
    const pendingRenewal = filteredContracts.filter((c) => c.status === "pending-renewal");

    // Total active value
    const activeValue = activeContracts.reduce((sum, contract) => sum + toNumber(contract.amount), 0);

    // Average contract value
    const averageValue = filteredContracts.length > 0 
      ? totalValue / filteredContracts.length 
      : 0;

    return {
      totalValue,
      activeContracts: activeContracts.length,
      activeValue,
      expiringSoon: expiringSoon.length,
      pendingRenewal: pendingRenewal.length,
      totalContracts: filteredContracts.length,
      averageValue,
    };
  }, [contracts, currency]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Contract Value"
        value={formatCurrency(stats.totalValue, currency)}
        icon={DollarSign}
        description={`${stats.totalContracts} contracts`}
        variant="gradient"
      />
      <StatCard
        title="Active Contracts"
        value={stats.activeContracts}
        icon={FileText}
        description={formatCurrency(stats.activeValue, currency)}
      />
      <StatCard
        title="Expiring Soon"
        value={stats.expiringSoon}
        icon={AlertCircle}
        description="Next 30 days"
        variant={stats.expiringSoon > 0 ? "muted" : "default"}
      />
      <StatCard
        title="Pending Renewal"
        value={stats.pendingRenewal}
        icon={Calendar}
        description="Awaiting action"
        variant={stats.pendingRenewal > 0 ? "muted" : "default"}
      />
    </div>
  );
}

