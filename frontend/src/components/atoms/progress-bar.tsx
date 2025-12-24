import { cn } from "@/lib/utils";
import { forwardRef, HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const progressBarVariants = cva(
  "relative w-full overflow-hidden rounded-full bg-secondary",
  {
    variants: {
      size: {
        xs: "h-1",
        sm: "h-1.5",
        md: "h-2",
        lg: "h-3",
        xl: "h-4",
      },
      variant: {
        default: "",
        striped: "",
        gradient: "",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
);

const progressFillVariants = cva(
  "h-full rounded-full transition-all duration-500 ease-out",
  {
    variants: {
      color: {
        primary: "bg-primary",
        success: "bg-success",
        warning: "bg-warning",
        error: "bg-destructive",
        info: "bg-info",
        gradient: "bg-gradient-to-r from-primary via-accent-500 to-primary",
      },
      animated: {
        true: "relative overflow-hidden",
        false: "",
      },
    },
    defaultVariants: {
      color: "primary",
      animated: false,
    },
  }
);

export interface ProgressBarProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof progressBarVariants> {
  value: number;
  max?: number;
  color?: "primary" | "success" | "warning" | "error" | "info" | "gradient";
  animated?: boolean;
  showValue?: boolean;
  valuePosition?: "inside" | "outside" | "tooltip";
  label?: string;
}

const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      className,
      size,
      variant,
      value,
      max = 100,
      color = "primary",
      animated = false,
      showValue = false,
      valuePosition = "outside",
      label,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div className="w-full space-y-1.5" ref={ref} {...props}>
        {(label || (showValue && valuePosition === "outside")) && (
          <div className="flex items-center justify-between text-sm">
            {label && (
              <span className="font-medium text-foreground">{label}</span>
            )}
            {showValue && valuePosition === "outside" && (
              <span className="text-muted-foreground font-medium tabular-nums">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}

        <div className={cn(progressBarVariants({ size, variant }), className)}>
          <div
            className={cn(
              progressFillVariants({ color, animated }),
              variant === "striped" &&
                "bg-[length:1rem_1rem] bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)]"
            )}
            style={{ width: `${percentage}%` }}
          >
            {animated && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            )}

            {showValue && valuePosition === "inside" && size !== "xs" && size !== "sm" && (
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = "ProgressBar";

export { ProgressBar, progressBarVariants };
