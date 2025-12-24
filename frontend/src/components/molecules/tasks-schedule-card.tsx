"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/atoms/select";
import { Button } from "@/components/atoms/button";
import { Calendar, ChevronDown, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInUp, transitions } from "@/lib/motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";

export interface TasksScheduleCardProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  month?: Date;
  onMonthChange?: (month: Date) => void;
  className?: string;
  delay?: number;
}

export function TasksScheduleCard({
  selectedDate = new Date(),
  onDateSelect,
  month = new Date(),
  onMonthChange,
  className,
  delay = 0,
}: TasksScheduleCardProps) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day of week for the month
  const firstDayOfWeek = monthStart.getDay();
  const weekDays = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

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
          <CardTitle className="text-lg font-semibold">My Tasks Schedule</CardTitle>
          <div className="flex items-center gap-2">
            <Select
              value={format(month, "MMMM")}
              onValueChange={(value) => {
                const newMonth = new Date(month);
                newMonth.setMonth(parseInt(value));
                onMonthChange?.(newMonth);
              }}
            >
              <SelectTrigger className="w-[120px] h-8">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
                <ChevronDown className="h-4 w-4 ml-2" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => {
                  const date = new Date(2024, i, 1);
                  return (
                    <SelectItem key={i} value={i.toString()}>
                      {format(date, "MMMM")}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before month start */}
              {Array.from({ length: firstDayOfWeek }, (_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Days of the month */}
              {days.map((day) => {
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, month);

                return (
                  <motion.button
                    key={day.toISOString()}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onDateSelect?.(day)}
                    className={cn(
                      "aspect-square rounded-full text-sm font-medium transition-colors",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : isToday
                          ? "bg-primary/20 text-primary font-semibold"
                          : isCurrentMonth
                            ? "text-foreground hover:bg-muted"
                            : "text-muted-foreground/50"
                    )}
                  >
                    {format(day, "d")}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


