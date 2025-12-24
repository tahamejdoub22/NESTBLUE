import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  variant?: "default" | "filled" | "outlined" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, variant = "default", size = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-20 text-xs px-3 py-2",
      md: "h-24 text-sm px-3 py-2",
      lg: "h-32 text-base px-4 py-3",
    };

    const variantClasses = {
      default: "border-input bg-background hover:border-input/80 focus:border-primary",
      filled: "border-transparent bg-muted/50 hover:bg-muted/70 focus:bg-background focus:border-primary",
      outlined: "border-2 border-input bg-transparent hover:border-primary/50 focus:border-primary",
      ghost: "border-transparent bg-transparent hover:bg-muted/30 focus:bg-muted/50 focus:border-primary/50",
    };

    return (
      <textarea
        className={cn(
          "flex w-full rounded-lg font-medium",
          "ring-offset-background",
          "placeholder:text-muted-foreground/60",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30",
          "transition-all duration-200 ease-in-out",
          "resize-none",
          sizeClasses[size],
          variantClasses[variant],
          error && "border-destructive focus-visible:ring-destructive focus-visible:border-destructive",
          !error && "focus-visible:shadow-sm focus-visible:shadow-primary/10",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };

