import { z } from "zod";

export const expenseSchema = z.object({
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
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  frequency: z.enum(["daily", "weekly", "monthly", "yearly", "one-time"], {
    message: "Please select a frequency",
  }),
  startDate: z.date({ message: "Start date is required" }),
  endDate: z.date().optional(),
  isActive: z.boolean().default(true),
  tags: z.array(z.string()).optional(),
  projectId: z.string().optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;



