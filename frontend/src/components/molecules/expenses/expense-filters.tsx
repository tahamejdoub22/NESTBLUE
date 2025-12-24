"use client";

import { useMemo } from "react";
import { Input } from "@/components/atoms/input";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Dropdown } from "@/components/molecules/dropdown";
import { Search, X, Filter } from "lucide-react";
import { COST_CATEGORIES } from "@/core/config/constants";
import type { CostCategory } from "@/interfaces";
import { useProjects } from "@/hooks/use-projects";

interface ExpenseFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  category?: CostCategory;
  onCategoryChange: (value: CostCategory | undefined) => void;
  frequency?: "daily" | "weekly" | "monthly" | "yearly" | "one-time";
  onFrequencyChange: (value: "daily" | "weekly" | "monthly" | "yearly" | "one-time" | undefined) => void;
  isActive?: boolean;
  onIsActiveChange: (value: boolean | undefined) => void;
  projectId?: string;
  onProjectIdChange?: (value: string | undefined) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "one-time", label: "One-time" },
];

export function ExpenseFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  frequency,
  onFrequencyChange,
  isActive,
  onIsActiveChange,
  projectId,
  onProjectIdChange,
  onClearFilters,
  hasActiveFilters,
}: ExpenseFiltersProps) {
  const { projects } = useProjects();

  const categoryItems = [
    { value: "", label: "All Categories" },
    ...COST_CATEGORIES.map((cat) => ({
      value: cat.value,
      label: cat.label,
    })),
  ];

  const frequencyItems = [
    { value: "", label: "All Frequencies" },
    ...FREQUENCIES,
  ];

  const statusItems = [
    { value: "", label: "All Status" },
    { value: "true", label: "Active" },
    { value: "false", label: "Inactive" },
  ];

  const projectOptions = useMemo(() => {
    return [
      { value: "", label: "All Projects" },
      { value: "unassigned", label: "Unassigned" },
      ...projects.map((p) => ({ value: p.uid, label: p.name })),
    ];
  }, [projects]);

  return (
    <Card className="border border-border/40 bg-card hover:shadow-md transition-all duration-200">
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Input
              placeholder="Search expenses by name..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              rightIcon={
                search ? (
                  <button
                    type="button"
                    onClick={() => onSearchChange("")}
                    className="hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : undefined
              }
              className="w-full"
            />
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-8 px-3 gap-2"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters:</span>
          </div>
          <div className="flex-1 min-w-[150px] sm:max-w-[200px]">
            <Dropdown
              items={categoryItems.map((item) => ({
                value: item.value,
                label: item.label,
              }))}
              value={category || ""}
              onSelect={(value) =>
                onCategoryChange(value === "" ? undefined : (value as CostCategory))
              }
              placeholder="All Categories"
            />
          </div>
          <div className="flex-1 min-w-[150px] sm:max-w-[200px]">
            <Dropdown
              items={frequencyItems.map((item) => ({
                value: item.value,
                label: item.label,
              }))}
              value={frequency || ""}
              onSelect={(value) =>
                onFrequencyChange(
                  value === "" ? undefined : (value as "daily" | "weekly" | "monthly" | "yearly" | "one-time")
                )
              }
              placeholder="All Frequencies"
            />
          </div>
          <div className="flex-1 min-w-[150px] sm:max-w-[200px]">
            <Dropdown
              items={statusItems.map((item) => ({
                value: item.value,
                label: item.label,
              }))}
              value={isActive === undefined ? "" : String(isActive)}
              onSelect={(value) =>
                onIsActiveChange(value === "" ? undefined : value === "true")
              }
              placeholder="All Status"
            />
          </div>
          {onProjectIdChange && (
            <div className="flex-1 min-w-[150px] sm:max-w-[200px]">
              <Dropdown
                items={projectOptions.map((item) => ({
                  value: item.value,
                  label: item.label,
                }))}
                value={projectId || ""}
                onSelect={(value) => onProjectIdChange(value === "" ? undefined : value)}
                placeholder="All Projects"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

