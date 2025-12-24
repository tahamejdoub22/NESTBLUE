// src/components/atoms/badge.tsx
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        primary: "border-transparent bg-primary/10 text-primary hover:bg-primary/20",
        secondary: "border-transparent bg-secondary/10 text-secondary-foreground hover:bg-secondary/20",
        destructive: "border-transparent bg-destructive/10 text-destructive hover:bg-destructive/20",
        success: "border-transparent bg-success/10 text-success hover:bg-success/20",
        warning: "border-transparent bg-warning/10 text-warning-600 dark:text-warning-400 hover:bg-warning/20",
        info: "border-transparent bg-info/10 text-info hover:bg-info/20",
        outline: "text-foreground border border-border hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        sm: "px-1.5 py-0 text-[9px]",
        md: "px-2 py-0.5 text-[10px]",
        lg: "px-2.5 py-1 text-[11px]",
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge };