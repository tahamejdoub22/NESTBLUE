import { cn } from "@/lib/utils";
import { forwardRef, HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const separatorVariants = cva("shrink-0 bg-border", {
  variants: {
    orientation: {
      horizontal: "h-[1px] w-full",
      vertical: "h-full w-[1px]",
    },
    variant: {
      default: "bg-border",
      muted: "bg-muted",
      strong: "bg-foreground/20",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
    variant: "default",
  },
});

export interface SeparatorProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof separatorVariants> {
  decorative?: boolean;
}

const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation, variant, decorative = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role={decorative ? "none" : "separator"}
        aria-orientation={orientation ?? undefined}
        className={cn(separatorVariants({ orientation, variant }), className)}
        {...props}
      />
    );
  }
);

Separator.displayName = "Separator";

export { Separator, separatorVariants };
