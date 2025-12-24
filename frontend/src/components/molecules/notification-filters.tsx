"use client";

import { Button } from "@/components/atoms/button";
import { NotificationType } from "@/interfaces";
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  AlertTriangle, 
  XCircle,
  FileText,
  FolderOpen,
  DollarSign,
  Receipt,
  Bell,
  BellOff,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface NotificationFiltersProps {
  selectedType: NotificationType | "all";
  onTypeChange: (type: NotificationType | "all") => void;
  selectedStatus: "all" | "unread" | "read";
  onStatusChange: (status: "all" | "unread" | "read") => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const typeOptions: Array<{ value: NotificationType | "all"; label: string; icon: React.ReactNode }> = [
  { value: "all", label: "All Types", icon: <Bell className="h-4 w-4" /> },
  { value: "info", label: "Info", icon: <Info className="h-4 w-4" /> },
  { value: "success", label: "Success", icon: <CheckCircle2 className="h-4 w-4" /> },
  { value: "warning", label: "Warning", icon: <AlertTriangle className="h-4 w-4" /> },
  { value: "error", label: "Error", icon: <XCircle className="h-4 w-4" /> },
  { value: "task", label: "Task", icon: <FileText className="h-4 w-4" /> },
  { value: "project", label: "Project", icon: <FolderOpen className="h-4 w-4" /> },
  { value: "budget", label: "Budget", icon: <DollarSign className="h-4 w-4" /> },
  { value: "cost", label: "Cost", icon: <Receipt className="h-4 w-4" /> },
  { value: "expense", label: "Expense", icon: <DollarSign className="h-4 w-4" /> },
];

const statusOptions: Array<{ value: "all" | "unread" | "read"; label: string; icon: React.ReactNode }> = [
  { value: "all", label: "All", icon: <Bell className="h-4 w-4" /> },
  { value: "unread", label: "Unread", icon: <BellOff className="h-4 w-4" /> },
  { value: "read", label: "Read", icon: <CheckCircle2 className="h-4 w-4" /> },
];

export function NotificationFilters({
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
  onClearFilters,
  hasActiveFilters,
}: NotificationFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Filter Notifications</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-8 text-xs gap-1"
          >
            <X className="h-3 w-3" />
            Clear all
          </Button>
        )}
      </div>

      {/* Status Filter */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">
          Status
        </label>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              variant={selectedStatus === option.value ? "primary" : "outline"}
              size="sm"
              onClick={() => onStatusChange(option.value)}
              className={cn(
                "gap-2 h-8 text-xs",
                selectedStatus === option.value && "shadow-sm"
              )}
            >
              {option.icon}
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Type Filter */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">
          Type
        </label>
        <div className="flex flex-wrap gap-2">
          {typeOptions.map((option) => (
            <Button
              key={option.value}
              variant={selectedType === option.value ? "primary" : "outline"}
              size="sm"
              onClick={() => onTypeChange(option.value)}
              className={cn(
                "gap-2 h-8 text-xs",
                selectedType === option.value && "shadow-sm"
              )}
            >
              {option.icon}
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

