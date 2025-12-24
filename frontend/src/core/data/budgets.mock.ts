import type { Budget } from "@/interfaces";

const now = new Date();
const lastMonth = new Date(now);
lastMonth.setMonth(lastMonth.getMonth() - 1);
const nextMonth = new Date(now);
nextMonth.setMonth(nextMonth.getMonth() + 1);
const nextQuarter = new Date(now);
nextQuarter.setMonth(nextQuarter.getMonth() + 3);

export const mockBudgets: Budget[] = [
  {
    id: "budget-1",
    name: "Monthly Office Rent",
    amount: 2500,
    currency: "USD",
    category: "housing",
    period: "monthly",
    startDate: new Date(now.getFullYear(), now.getMonth(), 1),
    endDate: undefined,
    createdAt: lastMonth,
    updatedAt: lastMonth,
  },
  {
    id: "budget-2",
    name: "Marketing Campaign Q4",
    amount: 10000,
    currency: "USD",
    category: "other",
    period: "monthly",
    startDate: new Date(now.getFullYear(), now.getMonth(), 1),
    endDate: nextQuarter,
    projectId: "prjmar004", // Marketing Campaign project
    createdAt: lastMonth,
    updatedAt: lastMonth,
  },
  {
    id: "budget-3",
    name: "Team Training",
    amount: 5000,
    currency: "USD",
    category: "education",
    period: "yearly",
    startDate: new Date(now.getFullYear(), 0, 1),
    endDate: new Date(now.getFullYear(), 11, 31),
    createdAt: lastMonth,
    updatedAt: lastMonth,
  },
  {
    id: "budget-4",
    name: "Cloud Services",
    amount: 350,
    currency: "USD",
    category: "utilities",
    period: "monthly",
    startDate: new Date(now.getFullYear(), now.getMonth(), 1),
    endDate: undefined,
    createdAt: lastMonth,
    updatedAt: lastMonth,
  },
  {
    id: "budget-5",
    name: "Equipment & Hardware",
    amount: 15000,
    currency: "USD",
    category: "other",
    period: "yearly",
    startDate: new Date(now.getFullYear(), 0, 1),
    endDate: new Date(now.getFullYear(), 11, 31),
    createdAt: lastMonth,
    updatedAt: lastMonth,
  },
  {
    id: "budget-6",
    name: "Development Budget",
    amount: 50000,
    currency: "USD",
    category: "other",
    period: "monthly",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-06-30"),
    projectId: "prjweb001", // Web Development project
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "budget-7",
    name: "Infrastructure Budget",
    amount: 10000,
    currency: "USD",
    category: "utilities",
    period: "monthly",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-06-30"),
    projectId: "prjweb001", // Web Development project
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "budget-8",
    name: "Mobile App Development Budget",
    amount: 80000,
    currency: "USD",
    category: "other",
    period: "monthly",
    startDate: new Date("2024-02-01"),
    endDate: new Date("2024-08-31"),
    projectId: "prjmob002", // Mobile App project
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
  },
  {
    id: "budget-9",
    name: "E-commerce Platform Budget",
    amount: 100000,
    currency: "USD",
    category: "other",
    period: "monthly",
    startDate: new Date("2024-03-01"),
    endDate: new Date("2024-12-31"),
    projectId: "prjeco003", // E-commerce Platform project
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-03-01"),
  },
  {
    id: "budget-10",
    name: "Infrastructure Upgrade Budget",
    amount: 50000,
    currency: "USD",
    category: "utilities",
    period: "monthly",
    startDate: new Date("2024-02-15"),
    endDate: new Date("2024-09-30"),
    projectId: "prjinf005", // Infrastructure Upgrade project
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-02-15"),
  },
];
