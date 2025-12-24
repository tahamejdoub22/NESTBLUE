import { z } from "zod";

export const sprintSchema = z.object({
  name: z.string().min(1, "Sprint name is required").max(255, "Sprint name is too long"),
  projectId: z.string().min(1, "Project is required"),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
  status: z.enum(["planned", "active", "completed"]).optional().default("planned"),
  goal: z.string().optional(),
}).refine((data) => {
  // End date must be after start date
  if (data.endDate && data.startDate) {
    return data.endDate >= data.startDate;
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

export type SprintFormData = z.infer<typeof sprintSchema>;

