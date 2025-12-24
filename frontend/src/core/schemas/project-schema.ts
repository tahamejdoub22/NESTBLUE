import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(255, "Project name is too long"),
  description: z.string().optional(),
  status: z.enum(["active", "archived", "on-hold"]).optional().default("active"),
  progress: z.number().min(0).max(100).optional().default(0),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  spaceId: z.string().optional(),
  createSpace: z.boolean().optional(),
  spaceName: z.string().optional(),
  spaceDescription: z.string().optional(),
}).refine((data) => {
  // If createSpace is true, spaceName must be provided
  if (data.createSpace && !data.spaceName?.trim()) {
    return false;
  }
  return true;
}, {
  message: "Space name is required when creating a space",
  path: ["spaceName"],
});

export type ProjectFormData = z.infer<typeof projectSchema>;


