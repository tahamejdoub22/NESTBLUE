import { Card, CardContent } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface StatCardTemplateProps {
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

export function renderStatCard(props: StatCardTemplateProps) {
  const {
    title,
    value,
    change,
    icon: Icon,
    description,
    className,
    variant = "default",
  } = props;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-lg",
        "border border-border bg-card",
        variant === "gradient" && "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground border-0 shadow-md",
        variant === "muted" && "bg-muted/50 border-muted",
        className
      )}
    >
      <CardContent className="p-6 relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            <p className={cn(
              "text-xs font-semibold uppercase tracking-wider mb-1",
              variant === "gradient" ? "text-primary-foreground/70" : "text-muted-foreground"
            )}>
              {title}
            </p>
            <div className="flex items-baseline gap-3 flex-wrap">
              <p className={cn(
                "text-3xl md:text-4xl font-bold tracking-tight leading-none",
                variant === "gradient" ? "text-primary-foreground" : "text-foreground"
              )}>
                {typeof value === "number" ? value.toLocaleString() : value}
              </p>
              {change && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded-full border transition-all duration-300",
                    variant === "gradient"
                      ? change.trend === "up"
                        ? "text-primary-foreground border-primary-foreground/30 bg-primary-foreground/20"
                        : change.trend === "down"
                          ? "text-primary-foreground/80 border-primary-foreground/20 bg-primary-foreground/10"
                          : "text-primary-foreground/70 border-primary-foreground/20 bg-primary-foreground/10"
                      : change.trend === "up"
                        ? "text-emerald-600 border-emerald-500/30 bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-400/30 dark:bg-emerald-400/10"
                        : change.trend === "down"
                          ? "text-red-600 border-red-500/30 bg-red-500/10 dark:text-red-400 dark:border-red-400/30 dark:bg-red-400/10"
                          : "text-muted-foreground"
                  )}
                >
                  {change.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 mr-1 inline-block" />
                  ) : change.trend === "down" ? (
                    <TrendingDown className="h-3 w-3 mr-1 inline-block" />
                  ) : null}
                  {Math.abs(change.value).toFixed(1)}%
                </Badge>
              )}
            </div>
            {description && (
              <p className={cn(
                "text-xs font-medium mt-1",
                variant === "gradient" ? "text-primary-foreground/80" : "text-muted-foreground"
              )}>
                {description}
              </p>
            )}
          </div>
          {Icon && (
            <div className={cn(
              "p-2.5 rounded-lg transition-all duration-300 flex-shrink-0",
              variant === "gradient"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-primary/10 text-primary"
            )}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

