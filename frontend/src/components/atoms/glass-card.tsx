import { cn } from "@/lib/utils";
import { forwardRef, HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const glassCardVariants = cva(
  "relative rounded-2xl backdrop-blur-xl transition-all duration-300",
  {
    variants: {
      variant: {
        default: [
          "bg-white/80 dark:bg-neutral-900/80",
          "border border-white/20 dark:border-white/10",
          "shadow-glass dark:shadow-glass-lg",
        ],
        frosted: [
          "bg-gradient-to-br from-white/60 to-white/30",
          "dark:from-neutral-800/60 dark:to-neutral-900/30",
          "border border-white/30 dark:border-white/10",
          "shadow-xl",
        ],
        subtle: [
          "bg-white/40 dark:bg-neutral-900/40",
          "border border-white/10 dark:border-white/5",
          "shadow-sm",
        ],
        colorful: [
          "bg-gradient-to-br from-primary-500/10 via-accent-500/10 to-primary-500/10",
          "dark:from-primary-500/20 dark:via-accent-500/20 dark:to-primary-500/20",
          "border border-primary-200/30 dark:border-primary-500/20",
          "shadow-primary-sm",
        ],
        dark: [
          "bg-neutral-900/90 dark:bg-neutral-950/90",
          "border border-neutral-700/50 dark:border-neutral-800/50",
          "shadow-2xl",
        ],
      },
      size: {
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
        xl: "p-8",
      },
      hover: {
        none: "",
        lift: "hover:-translate-y-1 hover:shadow-xl",
        glow: "hover:shadow-primary hover:border-primary-300 dark:hover:border-primary-600",
        scale: "hover:scale-[1.02]",
        border: "hover:border-primary-400 dark:hover:border-primary-500",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      hover: "none",
    },
  }
);

export interface GlassCardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {
  glow?: boolean;
  glowColor?: "primary" | "success" | "warning" | "error";
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, size, hover, glow, glowColor = "primary", children, ...props }, ref) => {
    const glowClasses = glow
      ? {
          primary: "glow-primary",
          success: "glow-success",
          warning: "glow-warning",
          error: "glow-error",
        }[glowColor]
      : "";

    return (
      <div
        ref={ref}
        className={cn(
          glassCardVariants({ variant, size, hover }),
          glowClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard, glassCardVariants };
