"use client";

import { useMemo } from "react";
import { Input } from "@/components/atoms/input";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Dropdown } from "@/components/molecules/dropdown";
import { DatePicker } from "@/components/molecules/date-picker";
import { Search, X, Filter } from "lucide-react";
import { COST_CATEGORIES, CONTRACT_STATUSES } from "@/core/config/constants";
import type { CostCategory, ContractStatus } from "@/interfaces";
import { useProjects } from "@/hooks/use-projects";

interface ContractFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status?: ContractStatus;
  onStatusChange: (value: ContractStatus | undefined) => void;
  category?: CostCategory;
  onCategoryChange: (value: CostCategory | undefined) => void;
  dateFrom?: Date;
  onDateFromChange: (date: Date | undefined) => void;
  dateTo?: Date;
  onDateToChange: (date: Date | undefined) => void;
  projectId?: string;
  onProjectIdChange?: (value: string | undefined) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function ContractFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  category,
  onCategoryChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  projectId,
  onProjectIdChange,
  onClearFilters,
  hasActiveFilters,
}: ContractFiltersProps) {
  const { projects } = useProjects();

  const categoryItems = [
    { value: "", label: "All Categories" },
    ...COST_CATEGORIES.map((cat) => ({
      value: cat.value,
      label: cat.label,
    })),
  ];

  const statusItems = [
    { value: "", label: "All Statuses" },
    ...CONTRACT_STATUSES.map((s) => ({
      value: s.value,
      label: s.label,
    })),
  ];

  const projectOptions = useMemo<Array<{ value: string; label: string }>>(() => {
    return [
      { value: "", label: "All Projects" },
      { value: "unassigned", label: "Unassigned" },
      ...projects.map((p) => ({ value: p.uid, label: p.name })),
    ];
  }, [projects]);

  return (
    <Card className="border border-border/40 bg-card hover:shadow-md transition-all duration-200">
      <CardContent className="p-4 space-y-4">
        {/* Search and Quick Filters */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Input
              placeholder="Search contracts by name, vendor, or contract number..."
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

        {/* Advanced Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters:</span>
          </div>
          <div className="flex-1 min-w-[150px] sm:max-w-[200px]">
            <Dropdown
              items={statusItems.map((item) => ({
                value: item.value,
                label: item.label,
              }))}
              value={status || ""}
              onSelect={(value) =>
                onStatusChange(value === "" ? undefined : (value as ContractStatus))
              }
              placeholder="All Statuses"
            />
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
            <DatePicker
              value={dateFrom}
              onChange={onDateFromChange}
              placeholder="Start date from"
            />
          </div>
          <div className="flex-1 min-w-[150px] sm:max-w-[200px]">
            <DatePicker
              value={dateTo}
              onChange={onDateToChange}
              placeholder="End date to"
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
