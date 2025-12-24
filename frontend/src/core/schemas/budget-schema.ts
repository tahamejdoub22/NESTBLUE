import { z } from "zod";

export const budgetSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  amount: z
    .number()
    .positive("Amount must be positive")
    .max(999999999, "Amount is too large"),
  currency: z.enum(["USD", "EUR", "GBP", "MAD"], {
    message: "Please select a currency",
  }),
  category: z.enum(
    [
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
    ],
    { message: "Please select a category" }
  ),
  period: z.enum(["daily", "weekly", "monthly", "yearly"], {
    message: "Please select a period",
  }),
  startDate: z.date({ message: "Start date is required" }),
  endDate: z.date().optional(),
  projectId: z.string().optional(),
});

export type BudgetFormData = z.infer<typeof budgetSchema>;



