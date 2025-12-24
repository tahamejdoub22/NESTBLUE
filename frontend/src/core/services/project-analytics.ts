import type {
  ProjectCost,
  ProjectExpense,
  ProjectBudget,
  ProjectFinancialSummary,
  ProjectCostBreakdown,
  ProjectExpenseAnalysis,
  ProjectTaskEstimate,
} from "@/interfaces/project.interface";
import type { Currency } from "@/interfaces";
import { Task } from "@/interfaces/task.interface";
import { CostCategory } from "@/interfaces";
import { toNumber } from "@/shared/utils/format";

export function calculateProjectFinancialSummary(
  costs: ProjectCost[],
  expenses: ProjectExpense[],
  budgets: ProjectBudget[],
  tasks: Task[],
  currency: Currency = "USD"
): ProjectFinancialSummary {
  // Filter by currency
  const filteredCosts = costs.filter((c) => c.currency === currency);
  const filteredExpenses = expenses.filter((e) => e.currency === currency);
  const filteredBudgets = budgets.filter((b) => b.currency === currency);

  // Calculate total spent (costs + projected expenses)
  const totalSpent = filteredCosts.reduce((sum, cost) => sum + toNumber(cost.amount), 0);
  
  // Calculate monthly projected expenses - only for active expenses
  const monthlyExpenses = filteredExpenses
    .filter((e) => e.isActive)
    .reduce((sum, expense) => {
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
        default:
          multiplier = 0;
      }
      return sum + toNumber(expense.amount) * multiplier;
    }, 0);

  // Calculate total estimated from tasks
  const totalEstimated = tasks
    .filter((task) => task.estimatedCost?.currency === currency)
    .reduce((sum, task) => sum + toNumber(task.estimatedCost?.amount || 0), 0);

  // Calculate total budget
  const totalBudget = filteredBudgets.reduce((sum, budget) => sum + toNumber(budget.amount), 0);

  // Calculate remaining budget
  const remaining = totalBudget - totalSpent;

  // Budget utilization percentage
  const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Estimated completion (spent + estimated from tasks)
  const estimatedCompletion = totalSpent + totalEstimated;

  // Variance (budget - estimated completion)
  const variance = totalBudget - estimatedCompletion;

  return {
    totalBudget,
    totalSpent,
    totalEstimated,
    remaining,
    currency,
    budgetUtilization,
    estimatedCompletion,
    variance,
  };
}

export function calculateProjectCostBreakdown(
  costs: ProjectCost[],
  budgets: ProjectBudget[],
  tasks: Task[],
  currency: Currency = "USD"
): ProjectCostBreakdown[] {
  const categories: CostCategory[] = [
    "housing",
    "transportation",
    "food",
    "utilities",
    "healthcare",
    "entertainment",
    "shopping",
    "education",
    "savings",
    "other",
  ];

  const filteredCosts = costs.filter((c) => c.currency === currency);
  const filteredBudgets = budgets.filter((b) => b.currency === currency);
  const filteredTasks = tasks.filter(
    (t) => t.estimatedCost?.currency === currency
  );

  const breakdown = categories.map((category) => {
    const categoryCosts = filteredCosts.filter((c) => c.category === category);
    const categoryBudgets = filteredBudgets.filter((b) => b.category === category);
    const categoryTasks = filteredTasks.filter(
      (t) => t.estimatedCost && category === "other" // For simplicity, task estimates go to "other"
    );

    const budgeted = categoryBudgets.reduce((sum, b) => sum + toNumber(b.amount), 0);
    const spent = categoryCosts.reduce((sum, c) => sum + toNumber(c.amount), 0);
    const estimated = categoryTasks.reduce(
      (sum, t) => sum + toNumber(t.estimatedCost?.amount || 0),
      0
    );
    const remaining = budgeted - spent;
    const total = budgeted + estimated;
    const percentage = total > 0 ? (spent / total) * 100 : 0;

    return {
      category,
      budgeted,
      spent,
      estimated,
      remaining,
      percentage,
    };
  });

  return breakdown.filter((b) => b.budgeted > 0 || b.spent > 0 || b.estimated > 0);
}

export function calculateProjectExpenseAnalysis(
  expenses: ProjectExpense[],
  currency: Currency = "USD"
): ProjectExpenseAnalysis {
  const filteredExpenses = expenses.filter((e) => e.currency === currency && e.isActive);

  // Calculate totals
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + toNumber(e.amount), 0);

  // Calculate monthly expenses - only for active expenses
  const monthlyExpenses = filteredExpenses.reduce((sum, expense) => {
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
      default:
        multiplier = 0;
    }
    return sum + toNumber(expense.amount) * multiplier;
  }, 0);

  // By category
  const categoryMap = new Map<string, number>();
  filteredExpenses.forEach((expense) => {
    const current = categoryMap.get(expense.category) || 0;
    categoryMap.set(expense.category, current + toNumber(expense.amount));
  });

  const byCategory = Array.from(categoryMap.entries()).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
  }));

  // By frequency
  const frequencyMap = new Map<string, { amount: number; count: number }>();
  filteredExpenses.forEach((expense) => {
    const current = frequencyMap.get(expense.frequency) || { amount: 0, count: 0 };
    frequencyMap.set(expense.frequency, {
      amount: current.amount + toNumber(expense.amount),
      count: current.count + 1,
    });
  });

  const byFrequency = Array.from(frequencyMap.entries()).map(([frequency, data]) => ({
    frequency,
    amount: data.amount,
    count: data.count,
  }));

  // Trends (last 6 months)
  const trends: { month: string; amount: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    
    const monthAmount = filteredExpenses.reduce((sum, expense) => {
      const expenseDate = new Date(expense.startDate);
      if (
        expenseDate.getMonth() === date.getMonth() &&
        expenseDate.getFullYear() === date.getFullYear()
      ) {
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
          default:
            multiplier = 0;
        }
        return sum + toNumber(expense.amount) * multiplier;
      }
      return sum;
    }, 0);

    trends.push({ month: monthName, amount: monthAmount });
  }

  return {
    totalExpenses,
    monthlyExpenses,
    byCategory,
    byFrequency,
    trends,
  };
}

export function getProjectTaskEstimates(
  tasks: Task[],
  currency: Currency = "USD"
): ProjectTaskEstimate[] {
  return tasks
    .filter((task) => task.estimatedCost && task.estimatedCost.currency === currency)
    .map((task) => ({
      taskId: task.uid,
      taskTitle: task.title,
      estimatedCost: task.estimatedCost!,
      status: task.status,
      priority: task.priority,
    }));
}

