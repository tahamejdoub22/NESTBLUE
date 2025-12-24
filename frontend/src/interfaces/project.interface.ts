import { BaseEntity } from "./base.interface";
import { Cost, Expense, Budget, Currency } from "./cost.interface";
import { Task } from "./task.interface";

// Project interface for mock data
export interface Project {
  uid: string; // Unique identifier (alphanumeric, like tasks)
  name: string;
  description: string;
  status?: "active" | "archived" | "on-hold";
  progress?: number;
  startDate?: Date;
  endDate?: Date;
}

// Dashboard Project interface
export interface DashboardProject extends BaseEntity {
  name: string;
  description?: string;
  status: "active" | "archived" | "on-hold";
  progress: number; // 0-100
  taskCount: number;
  completedTaskCount: number;
  teamMemberIds: string[];
  color?: string;
  icon?: string;
  budget?: {
    total: number;
    currency: "USD" | "EUR" | "GBP" | "MAD";
    spent: number;
    remaining: number;
  };
  startDate?: Date;
  endDate?: Date;
}

// Project-specific financial types
export interface ProjectCost extends Cost {
  projectId: string;
}

export interface ProjectExpense extends Expense {
  projectId: string;
}

export interface ProjectBudget extends Budget {
  projectId: string;
}

export interface ProjectFinancialSummary {
  totalBudget: number;
  totalSpent: number;
  totalEstimated: number; // From task estimates
  remaining: number;
  currency: Currency;
  budgetUtilization: number; // Percentage
  estimatedCompletion: number; // Estimated total cost including task estimates
  variance: number; // Difference between budget and estimated
}

export interface ProjectCostBreakdown {
  category: string;
  budgeted: number;
  spent: number;
  estimated: number;
  remaining: number;
  percentage: number;
}

export interface ProjectExpenseAnalysis {
  totalExpenses: number;
  monthlyExpenses: number;
  byCategory: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  byFrequency: {
    frequency: string;
    amount: number;
    count: number;
  }[];
  trends: {
    month: string;
    amount: number;
  }[];
}

export interface ProjectTaskEstimate {
  taskId: string;
  taskTitle: string;
  estimatedCost: {
    amount: number;
    currency: Currency;
  };
  status: string;
  priority: string;
}

export interface ProjectReport {
  projectId: string;
  projectName: string;
  period: {
    start: Date;
    end: Date;
  };
  summary: ProjectFinancialSummary;
  costBreakdown: ProjectCostBreakdown[];
  expenseAnalysis: ProjectExpenseAnalysis;
  taskEstimates: ProjectTaskEstimate[];
  costs: ProjectCost[];
  expenses: ProjectExpense[];
  budgets: ProjectBudget[];
  tasks: Task[];
}

