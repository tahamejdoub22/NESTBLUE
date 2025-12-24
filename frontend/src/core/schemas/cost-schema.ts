import { z } from "zod";

export const costSchema = z.object({
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
  date: z.date({ message: "Date is required" }),
  tags: z.array(z.string()).optional(),
  projectId: z.string().optional(),
  taskId: z.string().optional(),
});

export type CostFormData = z.infer<typeof costSchema>;



