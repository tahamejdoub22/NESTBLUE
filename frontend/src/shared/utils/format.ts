import { CURRENCIES } from "@/core/config/constants";
import type { Currency } from "@/interfaces";

// Safely convert possible string/undefined amounts to a number, falling back to 0
export function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function formatCurrency(amount: number | undefined | null | string, currency: Currency = "USD"): string {
  // Convert to number first to handle string amounts
  const safeAmount = toNumber(amount);
  
  // Handle NaN and Infinity
  if (!Number.isFinite(safeAmount)) {
    return `${CURRENCIES.find((c) => c.value === currency)?.symbol || "$"}0`;
  }
  
  const currencyInfo = CURRENCIES.find((c) => c.value === currency);
  
  // Format without trailing zeros
  const formatted = safeAmount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  // Remove .00 if present
  const cleaned = formatted.replace(/\.00$/, "");
  return `${currencyInfo?.symbol || "$"}${cleaned}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - d.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}
