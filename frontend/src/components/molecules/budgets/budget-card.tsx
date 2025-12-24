"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms";
import { Badge } from "@/components/atoms";
import { Button } from "@/components/atoms";
import { Pencil, Trash2, Calendar, FolderKanban, Target, Clock } from "lucide-react";
import type { Budget } from "@/interfaces";
import { CURRENCIES, COST_CATEGORIES } from "@/core/config/constants";
import { formatCurrency, formatDate } from "@/shared/utils/format";
import { useProjects } from "@/hooks/use-projects";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { fadeInUp, transitions } from "@/lib/motion";

interface BudgetCardProps {
  budget: Budget;
  onEdit?: (budget: Budget) => void;
  onDelete?: (id: string) => void;
  delay?: number;
}

const PERIOD_ICONS: Record<string, React.ReactNode> = {
  daily: <Clock className="h-3.5 w-3.5" />,
  weekly: <Clock className="h-3.5 w-3.5" />,
  monthly: <Calendar className="h-3.5 w-3.5" />,
  yearly: <Calendar className="h-3.5 w-3.5" />,
};

export function BudgetCard({ budget, onEdit, onDelete, delay = 0 }: BudgetCardProps) {
  const { projects } = useProjects();
  const currency = CURRENCIES.find((c) => c.value === budget.currency);
  const category = COST_CATEGORIES.find((c) => c.value === budget.category);
  const project = projects.find((p) => p.uid === budget.projectId);

  const startDate = budget.startDate ? format(new Date(budget.startDate), "MMM dd, yyyy") : '';
  const endDate = budget.endDate ? format(new Date(budget.endDate), "MMM dd, yyyy") : '';
  const periodLabel = budget.period ? budget.period.charAt(0).toUpperCase() + budget.period.slice(1) : '';

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
        "flex flex-col"
      )}>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3 px-4 pt-4">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-base font-semibold leading-tight line-clamp-2 flex-1">
                {budget.name}
              </CardTitle>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge 
                variant="secondary" 
                className="text-xs font-medium px-2 py-0.5 h-5"
              >
                {category?.label || budget.category}
              </Badge>
              {budget.period && (
                <Badge 
                  variant="outline" 
                  className="text-xs font-medium px-2 py-0.5 h-5 flex items-center gap-1 border-border/40"
                >
                  {PERIOD_ICONS[budget.period] || <Clock className="h-3.5 w-3.5" />}
                  {periodLabel}
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
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(budget);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(budget.id);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-foreground">
                {formatCurrency(budget.amount, budget.currency)}
              </span>
            </div>
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="flex-1">
                  <span className="font-medium">Start:</span> {startDate}
                </span>
              </div>
              {endDate && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="flex-1">
                    <span className="font-medium">End:</span> {endDate}
                  </span>
                </div>
              )}
              {!endDate && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="flex-1">Ongoing budget</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
