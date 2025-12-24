import { z } from "zod";

export const contractSchema = z.object({
  name: z
    .string()
    .min(1, "Contract name is required")
    .max(200, "Contract name must be less than 200 characters"),
  contractNumber: z
    .string()
    .min(1, "Contract number is required")
    .max(50, "Contract number must be less than 50 characters"),
  vendor: z
    .string()
    .min(1, "Vendor name is required")
    .max(100, "Vendor name must be less than 100 characters"),
  vendorEmail: z
    .string()
    .email("Invalid email address")
    .max(100, "Email must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  vendorPhone: z
    .string()
    .max(20, "Phone number must be less than 20 characters")
    .optional()
    .or(z.literal("")),
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
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  startDate: z.date({ message: "Start date is required" }),
  endDate: z.date().optional().nullable(),
  renewalDate: z.date().optional().nullable(),
  status: z.enum(
    ["draft", "active", "expired", "terminated", "pending-renewal", "cancelled"],
    { message: "Please select a status" }
  ),
  paymentFrequency: z.enum(
    ["one-time", "monthly", "quarterly", "semi-annual", "annual"],
    { message: "Please select a payment frequency" }
  ),
  autoRenew: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  projectId: z.string().optional(),
  attachments: z.array(z.string()).optional(),
  notes: z
    .string()
    .max(2000, "Notes must be less than 2000 characters")
    .optional(),
});

export type ContractFormData = z.infer<typeof contractSchema>;

