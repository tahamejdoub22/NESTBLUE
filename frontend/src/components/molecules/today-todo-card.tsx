"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, staggerContainer, staggerItem, transitions } from "@/lib/motion";

export interface TodoItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon?: React.ReactNode;
  iconColor?: string;
}

export interface TodayTodoCardProps {
  todos: TodoItem[];
  period?: string;
  onPeriodChange?: (period: string) => void;
  onTodoToggle?: (todoId: string) => void;
  className?: string;
  delay?: number;
}

export function TodayTodoCard({
  todos,
  period = "Today",
  onPeriodChange,
  onTodoToggle,
  className,
  delay = 0,
}: TodayTodoCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={{ ...transitions.default, delay }}
      className={cn("h-full", className)}
    >
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg font-semibold">Today Todo List</CardTitle>
          <Select value={period} onValueChange={onPeriodChange}>
            <SelectTrigger className="w-[100px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Today">Today</SelectItem>
              <SelectItem value="This week">This week</SelectItem>
              <SelectItem value="This month">This month</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {todos.map((todo, index) => (
              <motion.div
                key={todo.id}
                variants={staggerItem}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onTodoToggle?.(todo.id)}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all",
                  todo.completed
                    ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                    : "bg-card border-border hover:bg-muted/50"
                )}
              >
                <div className="flex items-start gap-3">
                  {todo.icon && (
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
                        todo.iconColor || "bg-primary/10 text-primary"
                      )}
                    >
                      {todo.icon}
                    </div>
                  )}
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4
                      className={cn(
                        "font-semibold text-sm",
                        todo.completed && "line-through text-muted-foreground"
                      )}
                    >
                      {todo.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">{todo.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {todo.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


