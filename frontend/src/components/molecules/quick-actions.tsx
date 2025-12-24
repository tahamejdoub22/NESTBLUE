"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";
import { Plus, Target, Users, DollarSign, FileText } from "lucide-react";
import { fadeInUp, transitions } from "@/lib/motion";

export interface QuickActionsProps {
  className?: string;
  onActionClick?: (action: string) => void;
}

const actions = [
  {
    id: "create-task",
    label: "Create Task",
    icon: Plus,
    color: "text-primary",
    bgColor: "bg-primary/10 border-primary/20",
  },
  {
    id: "create-sprint",
    label: "Create Sprint",
    icon: Target,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    id: "add-member",
    label: "Add Member",
    icon: Users,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20",
  },
  {
    id: "log-cost",
    label: "Log Cost",
    icon: DollarSign,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10 border-amber-500/20",
  },
];

export const QuickActions = memo(function QuickActions({ className, onActionClick }: QuickActionsProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={transitions.default}
      className={className}
    >
      <Card className="relative overflow-hidden border border-border/40 bg-card hover:shadow-md transition-all duration-200">
        <CardHeader className="relative z-10 pb-3 px-4 pt-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 pt-0 px-4 pb-4">
          <div className="grid grid-cols-2 gap-1.5">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full h-auto p-2 flex flex-col items-center gap-1 border",
                      action.bgColor
                    )}
                    onClick={() => onActionClick?.(action.id)}
                  >
                    <div className={cn("p-1 rounded", action.bgColor)}>
                      <Icon className={cn("h-3.5 w-3.5", action.color)} />
                    </div>
                    <span className={cn("text-[10px] font-medium", action.color)}>
                      {action.label}
                    </span>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

