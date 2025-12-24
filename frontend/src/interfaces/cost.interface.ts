import { BaseEntity } from "./base.interface";

export type Currency = "USD" | "EUR" | "GBP" | "MAD";

export type CostCategory =
  | "housing"
  | "transportation"
  | "food"
  | "utilities"
  | "healthcare"
  | "entertainment"
  | "shopping"
  | "education"
  | "savings"
  | "other";

// Cost domain types
export interface Cost extends BaseEntity {
  name: string;
  amount: number;
  currency: Currency;
  category: CostCategory;
  description?: string;
  date: Date;
  tags?: string[];
  projectId?: string; // Link to project
  taskId?: string; // Link to task
}

// Expense domain types (recurring expenses)
export interface Expense extends BaseEntity {
  name: string;
  amount: number;
  currency: Currency;
  category: CostCategory;
  description?: string;
  frequency: ExpenseFrequency;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  tags?: string[];
  projectId?: string; // Link to project
}

export type ExpenseFrequency = "daily" | "weekly" | "monthly" | "yearly" | "one-time";

// Budget domain types
export interface Budget extends BaseEntity {
  name: string;
  amount: number;
  currency: Currency;
  category: CostCategory;
  period: BudgetPeriod;
  startDate: Date;
  endDate?: Date;
  projectId?: string; // Link to project
}

export type BudgetPeriod = "daily" | "weekly" | "monthly" | "yearly";

// Analytics types
export interface FinancialAnalytics {
  totalCosts: number;
  totalExpenses: number;
  totalBudgets: number;
  budgetUtilization: number; // Percentage
  categoryBreakdown: CategoryBreakdown[];
  monthlyTrend: MonthlyTrend[];
  budgetVsActual: BudgetVsActual[];
  topCategories: CategorySpending[];
}

export interface CategoryBreakdown {
  category: CostCategory;
  costs: number;
  expenses: number;
  budgets: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  costs: number;
  expenses: number;
  budgets: number;
}

export interface BudgetVsActual {
  category: CostCategory;
  budgeted: number;
  actual: number;
  variance: number;
  percentage: number;
}

export interface CategorySpending {
  category: CostCategory;
  total: number;
  count: number;
}

// Form types
export type CreateCostInput = Omit<Cost, "id" | "createdAt" | "updatedAt">;
export type UpdateCostInput = Partial<CreateCostInput>;

export type CreateExpenseInput = Omit<Expense, "id" | "createdAt" | "updatedAt">;
export type UpdateExpenseInput = Partial<CreateExpenseInput>;

export type CreateBudgetInput = Omit<Budget, "id" | "createdAt" | "updatedAt">;
export type UpdateBudgetInput = Partial<CreateBudgetInput>;

