// src/components/molecules/status-select.tsx
"use client";

import { BadgeMenu } from "./badge-menu";
import { cn } from "@/lib/utils";

interface StatusSelectProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

interface BadgeMenuItem {
  value: string;
  label: string;
}

const statusItems: BadgeMenuItem[] = [
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "complete", label: "Complete" }
];

export function StatusSelect({ value, onChange, className }: StatusSelectProps) {
  return (
    <BadgeMenu
      items={statusItems}
      value={value}
      onSelect={onChange}
      placeholder="Status"
      className={className}
      badgeClassName={cn(
        "capitalize px-3 py-1",
        value === "todo" && "bg-blue-50 text-blue-700 border-blue-200",
        value === "in-progress" && "bg-yellow-50 text-yellow-700 border-yellow-200",
        value === "complete" && "bg-green-50 text-green-700 border-green-200"
      )}
    />
  );
}