import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(255, "Task title is too long"),
  description: z.string().optional(),
  status: z.enum(["todo", "in-progress", "complete", "backlog"]).optional().default("todo"),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional().default("medium"),
  assigneeIds: z.array(z.string()).optional().default([]),
  dueDate: z.date().optional(),
  startDate: z.date().optional(),
  estimatedCost: z.object({
    amount: z.number().min(0).optional(),
    currency: z.enum(["USD", "EUR", "GBP", "MAD"]).optional().default("USD"),
  }).optional(),
  projectId: z.string().optional(),
  sprintId: z.string().optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;


