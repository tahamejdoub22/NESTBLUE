"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms";
import { Badge } from "@/components/atoms";
import { Button } from "@/components/atoms";
import { Pencil, Trash2, FolderKanban, Calendar, DollarSign } from "lucide-react";
import type { Cost } from "@/interfaces";
import { CURRENCIES, COST_CATEGORIES } from "@/core/config/constants";
import { useProjects } from "@/hooks/use-projects";
import { formatCurrency } from "@/shared/utils/format";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { fadeInUp, transitions } from "@/lib/motion";

interface CostCardProps {
  cost: Cost;
  onEdit?: (cost: Cost) => void;
  onDelete?: (id: string) => void;
  delay?: number;
}

export function CostCard({ cost, onEdit, onDelete, delay = 0 }: CostCardProps) {
  const { projects } = useProjects();
  const currency = CURRENCIES.find((c) => c.value === cost.currency);
  const category = COST_CATEGORIES.find((c) => c.value === cost.category);
  const project = projects.find((p) => p.uid === cost.projectId);

  // Ensure amount is a number (handle string from backend)
  const amount = typeof cost.amount === 'string' ? parseFloat(cost.amount) : cost.amount;
  const formattedAmount = isNaN(amount) ? '0.00' : amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formattedDate = cost.date ? format(new Date(cost.date), "MMM dd, yyyy") : '';

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
            <CardTitle className="text-base font-semibold leading-tight line-clamp-2">
              {cost.name}
            </CardTitle>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge 
                variant="secondary" 
                className="text-xs font-medium px-2 py-0.5 h-5"
              >
                {category?.label || cost.category}
              </Badge>
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
                  onEdit(cost);
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
                  onDelete(cost.id);
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
              <div className="flex items-baseline gap-1.5">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold text-foreground">
                  {currency?.symbol || '$'}{formattedAmount}
                </span>
              </div>
              {formattedDate && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formattedDate}</span>
                </div>
              )}
            </div>
            {cost.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {cost.description}
              </p>
            )}
            {cost.tags && cost.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {cost.tags.slice(0, 3).map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="text-xs font-normal px-2 py-0.5 h-5 border-border/40"
                  >
                    {tag}
                  </Badge>
                ))}
                {cost.tags.length > 3 && (
                  <Badge 
                    variant="outline" 
                    className="text-xs font-normal px-2 py-0.5 h-5 border-border/40"
                  >
                    +{cost.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
