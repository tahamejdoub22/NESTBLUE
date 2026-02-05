"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms";
import { Badge } from "@/components/atoms";
import { Button } from "@/components/atoms";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/atoms";
import { Pencil, Trash2, Repeat, Calendar, FolderKanban, Receipt, CheckCircle2, XCircle } from "lucide-react";
import type { Expense } from "@/interfaces";
import { CURRENCIES, COST_CATEGORIES } from "@/core/config/constants";
import { formatCurrency, formatDate } from "@/shared/utils/format";
import { useProjects } from "@/hooks/use-projects";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { fadeInUp, transitions } from "@/lib/motion";

interface ExpenseCardProps {
  expense: Expense;
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
  delay?: number;
}

const FREQUENCY_LABELS: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
  "one-time": "One-time",
};

export function ExpenseCard({ expense, onEdit, onDelete, delay = 0 }: ExpenseCardProps) {
  const { projects } = useProjects();
  const currency = CURRENCIES.find((c) => c.value === expense.currency);
  const category = COST_CATEGORIES.find((c) => c.value === expense.category);
  const project = projects.find((p) => p.uid === expense.projectId);

  const startDate = expense.startDate ? format(new Date(expense.startDate), "MMM dd, yyyy") : '';
  const endDate = expense.endDate ? format(new Date(expense.endDate), "MMM dd, yyyy") : '';
  const frequencyLabel = FREQUENCY_LABELS[expense.frequency] || expense.frequency;

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={{ ...transitions.default, delay }}
      className="h-full"
    >
      <Card className={cn(
        "group h-full border border-border/40 bg-card hover:shadow-md transition-all duration-200",
        "flex flex-col",
        !expense.isActive && "opacity-75"
      )}>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3 px-4 pt-4">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center",
                expense.isActive 
                  ? "bg-green-500/10" 
                  : "bg-muted"
              )}>
                <Receipt className={cn(
                  "h-4 w-4",
                  expense.isActive 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-muted-foreground"
                )} />
              </div>
              <CardTitle className="text-base font-semibold leading-tight line-clamp-2 flex-1">
                {expense.name}
              </CardTitle>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge 
                variant="secondary" 
                className="text-xs font-medium px-2 py-0.5 h-5"
              >
                {category?.label || expense.category}
              </Badge>
              {expense.frequency && (
                <Badge 
                  variant="outline" 
                  className="text-xs font-medium px-2 py-0.5 h-5 flex items-center gap-1 border-border/40"
                >
                  <Repeat className="h-3.5 w-3.5" />
                  {frequencyLabel}
                </Badge>
              )}
              {expense.isActive ? (
                <Badge 
                  variant="outline" 
                  className="text-xs font-medium px-2 py-0.5 h-5 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 flex items-center gap-1"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Active
                </Badge>
              ) : (
                <Badge 
                  variant="outline" 
                  className="text-xs font-medium px-2 py-0.5 h-5 text-muted-foreground border-border/40 flex items-center gap-1"
                >
                  <XCircle className="h-3 w-3" />
                  Inactive
                </Badge>
              )}
              {project && (
                <Badge 
                  variant="outline" 
                  className="text-xs font-medium px-2 py-0.5 h-5 flex items-center gap-1 border-border/40"
                >
                  <FolderKanban className="h-3 w-3" />
                  <span className="truncate max-w-[100px]">{project.name}</span>
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
            {onEdit && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:bg-muted"
                    aria-label="Edit expense"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(expense);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit expense</p>
                </TooltipContent>
              </Tooltip>
            )}
            {onDelete && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    aria-label="Delete expense"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(expense.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete expense</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-foreground">
                {formatCurrency(expense.amount, expense.currency)}
              </span>
            </div>
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="flex-1">
                  <span className="font-medium">Started:</span> {startDate}
                </span>
              </div>
              {endDate && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="flex-1">
                    <span className="font-medium">Ends:</span> {endDate}
                  </span>
                </div>
              )}
              {!endDate && expense.isActive && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Repeat className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="flex-1">Recurring indefinitely</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
