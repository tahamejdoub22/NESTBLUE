import type {
  Cost,
  Expense,
  Budget,
  FinancialAnalytics,
  CategoryBreakdown,
  MonthlyTrend,
  BudgetVsActual,
  CategorySpending,
  CostCategory,
} from "@/interfaces";

// Safely convert possible string/undefined amounts to a number, falling back to 0
const toNumber = (value: unknown): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

export function calculateFinancialAnalytics(
  costs: Cost[],
  expenses: Expense[],
  budgets: Budget[],
  currency: "USD" | "EUR" | "GBP" | "MAD" = "USD",
  projectId?: string
): FinancialAnalytics {
  // Filter by currency and project
  let filteredCosts = costs.filter((c) => c.currency === currency);
  let filteredExpenses = expenses.filter((e) => e.currency === currency);
  let filteredBudgets = budgets.filter((b) => b.currency === currency);

  // Filter by project if specified
  if (projectId) {
    filteredCosts = filteredCosts.filter((c) => c.projectId === projectId);
    filteredExpenses = filteredExpenses.filter((e) => e.projectId === projectId);
    filteredBudgets = filteredBudgets.filter((b) => b.projectId === projectId);
  }

  // Calculate totals
  const totalCosts = filteredCosts.reduce((sum, cost) => sum + toNumber(cost.amount), 0);
  
  // Calculate projected monthly expenses
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
        default:
          multiplier = 0;
      }
      return sum + toNumber(expense.amount) * multiplier;
    }, 0);

  const totalExpenses = monthlyExpenses;
  const totalBudgets = filteredBudgets.reduce((sum, budget) => sum + toNumber(budget.amount), 0);

  // Budget utilization
  const budgetUtilization = totalBudgets > 0 ? (totalCosts / totalBudgets) * 100 : 0;

  // Category breakdown
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

  const categoryBreakdown: CategoryBreakdown[] = categories.map((category) => {
    const categoryCosts = filteredCosts
      .filter((c) => c.category === category)
      .reduce((sum, c) => sum + toNumber(c.amount), 0);

    const categoryExpenses = filteredExpenses
      .filter((e) => e.category === category && e.isActive)
      .reduce((sum, e) => {
        let multiplier = 0;
        switch (e.frequency) {
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
        return sum + toNumber(e.amount) * multiplier;
      }, 0);

    const categoryBudgets = filteredBudgets
      .filter((b) => b.category === category)
      .reduce((sum, b) => sum + toNumber(b.amount), 0);

    const total = categoryCosts + categoryExpenses;
    const grandTotal = totalCosts + totalExpenses;
    const percentage = grandTotal > 0 ? (total / grandTotal) * 100 : 0;

    return {
      category,
      costs: categoryCosts,
      expenses: categoryExpenses,
      budgets: categoryBudgets,
      percentage,
    };
  });

  // Monthly trend (last 6 months)
  const monthlyTrend: MonthlyTrend[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = month.toLocaleDateString("en-US", { month: "short", year: "numeric" });

    const monthCosts = filteredCosts
      .filter((c) => {
        const costDate = new Date(c.date);
        return (
          costDate.getMonth() === month.getMonth() &&
          costDate.getFullYear() === month.getFullYear()
        );
      })
      .reduce((sum, c) => sum + toNumber(c.amount), 0);

    const monthExpenses = filteredExpenses
      .filter((e) => {
        const startDate = new Date(e.startDate);
        const endDate = e.endDate ? new Date(e.endDate) : new Date(now.getFullYear() + 1, 11, 31);
        return e.isActive && month >= startDate && month <= endDate;
      })
      .reduce((sum, e) => {
        let multiplier = 0;
        switch (e.frequency) {
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
        return sum + toNumber(e.amount) * multiplier;
      }, 0);

    const monthBudgets = filteredBudgets
      .filter((b) => {
        const startDate = new Date(b.startDate);
        const endDate = b.endDate ? new Date(b.endDate) : new Date(now.getFullYear() + 1, 11, 31);
        return month >= startDate && month <= endDate;
      })
      .reduce((sum, b) => sum + toNumber(b.amount), 0);

    monthlyTrend.push({
      month: monthStr,
      costs: monthCosts,
      expenses: monthExpenses,
      budgets: monthBudgets,
    });
  }

  // Budget vs Actual
  const budgetVsActual: BudgetVsActual[] = categories.map((category) => {
    const budgeted = filteredBudgets
      .filter((b) => b.category === category)
      .reduce((sum, b) => sum + toNumber(b.amount), 0);

    const actual =
      filteredCosts
        .filter((c) => c.category === category)
        .reduce((sum, c) => sum + toNumber(c.amount), 0) +
      filteredExpenses
        .filter((e) => e.category === category && e.isActive)
        .reduce((sum, e) => {
          let multiplier = 0;
          switch (e.frequency) {
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
          return sum + toNumber(e.amount) * multiplier;
        }, 0);

    const variance = actual - budgeted;
    const percentage = budgeted > 0 ? (actual / budgeted) * 100 : 0;

    return {
      category,
      budgeted,
      actual,
      variance,
      percentage,
    };
  });

  // Top categories
  const topCategories: CategorySpending[] = categoryBreakdown
    .map((cb) => ({
      category: cb.category,
      total: cb.costs + cb.expenses,
      count:
        filteredCosts.filter((c) => c.category === cb.category).length +
        filteredExpenses.filter((e) => e.category === cb.category && e.isActive).length,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return {
    totalCosts,
    totalExpenses,
    totalBudgets,
    budgetUtilization,
    categoryBreakdown,
    monthlyTrend,
    budgetVsActual,
    topCategories,
  };
}

