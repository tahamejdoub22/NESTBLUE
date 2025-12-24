"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms";
import { Badge } from "@/components/atoms";
import { Button } from "@/components/atoms";
import { Pencil, Trash2, FolderKanban, Calendar, Mail, Phone, FileText, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import type { Contract } from "@/interfaces";
import { CURRENCIES, CONTRACT_STATUSES, COST_CATEGORIES } from "@/core/config/constants";
import { useProjects } from "@/hooks/use-projects";
import { formatCurrency } from "@/shared/utils/format";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { fadeInUp, transitions } from "@/lib/motion";

interface ContractCardProps {
  contract: Contract;
  onEdit?: (contract: Contract) => void;
  onDelete?: (id: string) => void;
  delay?: number;
}

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
  active: {
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-500/10 border-green-500/20",
  },
  expired: {
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-500/10 border-red-500/20",
  },
  "pending-renewal": {
    icon: <Clock className="h-3.5 w-3.5" />,
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-500/10 border-yellow-500/20",
  },
  draft: {
    icon: <FileText className="h-3.5 w-3.5" />,
    color: "text-muted-foreground",
    bgColor: "bg-muted border-border/40",
  },
};

export function ContractCard({ contract, onEdit, onDelete, delay = 0 }: ContractCardProps) {
  const { projects } = useProjects();
  const currency = CURRENCIES.find((c) => c.value === contract.currency);
  const category = COST_CATEGORIES.find((c) => c.value === contract.category);
  const status = CONTRACT_STATUSES.find((s) => s.value === contract.status);
  const project = projects.find((p) => p.uid === contract.projectId);
  
  const statusConfig = STATUS_CONFIG[contract.status] || STATUS_CONFIG.draft;
  
  const isExpiringSoon = contract.endDate && contract.status === "active" && (() => {
    const endDate = new Date(contract.endDate);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return endDate >= now && endDate <= thirtyDaysFromNow;
  })();

  const startDate = contract.startDate ? format(new Date(contract.startDate), "MMM dd, yyyy") : '';
  const endDate = contract.endDate ? format(new Date(contract.endDate), "MMM dd, yyyy") : '';

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
              <div className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center",
                statusConfig.bgColor
              )}>
                <FileText className={cn("h-4 w-4", statusConfig.color)} />
              </div>
              <CardTitle className="text-base font-semibold leading-tight line-clamp-2 flex-1">
                {contract.name}
              </CardTitle>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs font-medium px-2 py-0.5 h-5 flex items-center gap-1",
                  statusConfig.bgColor,
                  statusConfig.color,
                  "border-current/20"
                )}
              >
                {statusConfig.icon}
                {status?.label || contract.status}
              </Badge>
              <Badge 
                variant="secondary" 
                className="text-xs font-medium px-2 py-0.5 h-5"
              >
                {category?.label || contract.category}
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
              {isExpiringSoon && (
                <Badge 
                  variant="outline" 
                  className="text-xs font-medium px-2 py-0.5 h-5 bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
                >
                  <AlertTriangle className="h-3 w-3" />
                  Expiring Soon
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
                  onEdit(contract);
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
                  onDelete(contract.id);
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
                {formatCurrency(contract.amount, contract.currency)}
              </span>
              <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">
                {contract.contractNumber}
              </span>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-medium text-foreground truncate">{contract.vendor}</span>
              </div>
              
              {(contract.vendorEmail || contract.vendorPhone) && (
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {contract.vendorEmail && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate max-w-[150px]">{contract.vendorEmail}</span>
                    </div>
                  )}
                  {contract.vendorPhone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                      <span>{contract.vendorPhone}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1.5 pt-1">
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
              </div>

              <div className="flex items-center gap-1.5 pt-1">
                <Badge variant="outline" className="text-xs font-normal px-2 py-0.5 h-5 border-border/40">
                  {contract.paymentFrequency}
                </Badge>
                {contract.autoRenew && (
                  <Badge variant="outline" className="text-xs font-normal px-2 py-0.5 h-5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                    Auto-renew
                  </Badge>
                )}
              </div>
            </div>

            {contract.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed pt-1">
                {contract.description}
              </p>
            )}

            {contract.tags && contract.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {contract.tags.slice(0, 3).map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="text-xs font-normal px-2 py-0.5 h-5 border-border/40"
                  >
                    {tag}
                  </Badge>
                ))}
                {contract.tags.length > 3 && (
                  <Badge 
                    variant="outline" 
                    className="text-xs font-normal px-2 py-0.5 h-5 border-border/40"
                  >
                    +{contract.tags.length - 3}
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
