// src/components/molecules/priority-select.tsx
"use client";

import { BadgeMenu } from "./badge-menu";
import { cn } from "@/lib/utils";

interface BadgeMenuItem {
  value: string;
  label: string;
  color: string;
}

interface PrioritySelectProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  size?: "sm" | "md";
}

const priorityItems: BadgeMenuItem[] = [
  { value: "low", label: "Low", color: "#6B7280" },
  { value: "medium", label: "Medium", color: "#3B82F6" },
  { value: "high", label: "High", color: "#F59E0B" },
  { value: "urgent", label: "Urgent", color: "#EF4444" }
];

export function PrioritySelect({ value, onChange, className, size = "md" }: PrioritySelectProps) {
  return (
    <BadgeMenu
      items={priorityItems}
      value={value}
      onSelect={onChange}
      placeholder="Priority"
      className={className}
      badgeClassName={cn(
        "capitalize font-bold tracking-tight shadow-sm",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
        value === "low" && "bg-gray-500 text-white border-gray-600",
        value === "medium" && "bg-primary text-white border-primary",
        value === "high" && "bg-warning text-white border-warning-600",
        value === "urgent" && "bg-destructive text-white border-destructive",
        !value && "text-foreground"
      )}
    />
  );
}