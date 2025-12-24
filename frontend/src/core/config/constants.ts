import type { CostCategory, Currency, ContractStatus, PaymentFrequency } from "@/interfaces";

export const APP_NAME = "Nest Blue";

export const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: "USD", label: "US Dollar", symbol: "$" },
  { value: "EUR", label: "Euro", symbol: "€" },
  { value: "GBP", label: "British Pound", symbol: "£" },
  { value: "MAD", label: "Moroccan Dirham", symbol: "DH" },
];

export const COST_CATEGORIES: { value: CostCategory; label: string }[] = [
  { value: "housing", label: "Housing" },
  { value: "transportation", label: "Transportation" },
  { value: "food", label: "Food & Dining" },
  { value: "utilities", label: "Utilities" },
  { value: "healthcare", label: "Healthcare" },
  { value: "entertainment", label: "Entertainment" },
  { value: "shopping", label: "Shopping" },
  { value: "education", label: "Education" },
  { value: "savings", label: "Savings" },
  { value: "other", label: "Other" },
];

export const CONTRACT_STATUSES: { value: ContractStatus; label: string; color: string }[] = [
  { value: "draft", label: "Draft", color: "bg-gray-500" },
  { value: "active", label: "Active", color: "bg-green-500" },
  { value: "expired", label: "Expired", color: "bg-red-500" },
  { value: "terminated", label: "Terminated", color: "bg-orange-500" },
  { value: "pending-renewal", label: "Pending Renewal", color: "bg-yellow-500" },
  { value: "cancelled", label: "Cancelled", color: "bg-gray-400" },
];

export const PAYMENT_FREQUENCIES: { value: PaymentFrequency; label: string }[] = [
  { value: "one-time", label: "One-time" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "semi-annual", label: "Semi-Annual" },
  { value: "annual", label: "Annual" },
];

export const DEFAULT_CURRENCY: Currency = "USD";
export const DEFAULT_PAGE_SIZE = 10;
