"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { fadeInUp, cardHover, transitions } from "@/lib/motion";

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: "up" | "down" | "stable";
  };
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  className?: string;
  variant?: "default" | "gradient" | "muted";
}

// Animated number component with count-up effect
function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const spring = useSpring(0, { stiffness: 50, damping: 30 });
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString()
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span className={className}>{display}</motion.span>;
}

export function StatCard(props: StatCardProps) {
  const {
    title,
    value,
    change,
    icon: Icon,
    description,
    className,
    variant = "default",
  } = props;

  const isNumber = typeof value === "number";
  const numericValue = isNumber ? value : 0;

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="h-full"
    >
      <Card
        className={cn(
          "group relative overflow-hidden h-full border-border/40",
          "hover:shadow-lg hover:border-primary/20 transition-all duration-300",
          variant === "gradient" && "bg-primary text-primary-foreground border-0 shadow-md",
          variant === "muted" && "bg-muted/30",
          className
        )}
      >
        <CardContent className="p-5 relative z-10 h-full flex flex-col justify-between">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-1">
              <p className={cn(
                "text-xs font-semibold uppercase tracking-wider",
                variant === "gradient" ? "text-primary-foreground/70" : "text-muted-foreground/80"
              )}>
                {title}
              </p>
              <div className="flex items-baseline gap-2">
                {isNumber ? (
                  <AnimatedNumber
                    value={numericValue}
                    className={cn(
                      "text-2xl font-bold tracking-tight",
                      variant === "gradient" ? "text-primary-foreground" : "text-foreground"
                    )}
                  />
                ) : (
                  <p className={cn(
                    "text-2xl font-bold tracking-tight",
                    variant === "gradient" ? "text-primary-foreground" : "text-foreground"
                  )}>
                    {value}
                  </p>
                )}
              </div>
            </div>
            {Icon && (
              <div className={cn(
                "p-2 rounded-xl transition-colors duration-300",
                variant === "gradient" ? "bg-white/10" : "bg-primary/5 group-hover:bg-primary/10"
              )}>
                <Icon className={cn(
                  "h-5 w-5",
                  variant === "gradient" ? "text-primary-foreground" : "text-primary"
                )} />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-auto">
            {change && (
              <div className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold",
                change.trend === "up"
                  ? "bg-success/10 text-success"
                  : change.trend === "down"
                    ? "bg-destructive/10 text-destructive"
                    : "bg-muted text-muted-foreground"
              )}>
                {change.trend === "up" ? (
                  <TrendingUp className="h-3 w-3" />
                ) : change.trend === "down" ? (
                  <TrendingDown className="h-3 w-3" />
                ) : null}
                {Math.abs(change.value).toFixed(1)}%
              </div>
            )}
            {description && (
              <p className={cn(
                "text-xs font-medium",
                variant === "gradient" ? "text-primary-foreground/60" : "text-muted-foreground/60"
              )}>
                {description}
              </p>
            )}
          </div>

          {/* Decorative background element */}
          <div className={cn(
            "absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20",
            variant === "gradient" ? "bg-white" : "bg-primary"
          )} />
        </CardContent>
      </Card>
    </motion.div>
  );
}

