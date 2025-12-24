import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: "default" | "filled" | "outlined" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, leftIcon, rightIcon, variant = "default", size = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-8 text-xs px-3",
      md: "h-10 text-sm px-3",
      lg: "h-12 text-base px-4",
    };

    const variantClasses = {
      default: "border-input bg-background hover:border-input/80 focus:border-primary",
      filled: "border-transparent bg-muted/50 hover:bg-muted/70 focus:bg-background focus:border-primary",
      outlined: "border-2 border-input bg-transparent hover:border-primary/50 focus:border-primary",
      ghost: "border-transparent bg-transparent hover:bg-muted/30 focus:bg-muted/50 focus:border-primary/50",
    };

    const iconPadding = {
      sm: {
        left: leftIcon ? "pl-8" : "",
        right: rightIcon ? "pr-8" : "",
      },
      md: {
        left: leftIcon ? "pl-10" : "",
        right: rightIcon ? "pr-10" : "",
      },
      lg: {
        left: leftIcon ? "pl-12" : "",
        right: rightIcon ? "pr-12" : "",
      },
    };

    const iconSize = {
      sm: "h-3.5 w-3.5",
      md: "h-4 w-4",
      lg: "h-5 w-5",
    };

    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10",
            "flex items-center justify-center",
            size === "sm" && "left-2.5",
            size === "lg" && "left-4"
          )}>
            <div className={cn(iconSize[size])}>
              {leftIcon}
            </div>
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex w-full rounded-lg py-2 font-medium",
            "ring-offset-background",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-muted-foreground/60",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30",
            "transition-all duration-200 ease-in-out",
            sizeClasses[size],
            variantClasses[variant],
            iconPadding[size].left,
            iconPadding[size].right,
            error && "border-destructive focus-visible:ring-destructive focus-visible:border-destructive",
            !error && "focus-visible:shadow-sm focus-visible:shadow-primary/10",
            className
          )}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <div className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10",
            "flex items-center justify-center",
            size === "sm" && "right-2.5",
            size === "lg" && "right-4"
          )}>
            <div className={cn(iconSize[size])}>
              {rightIcon}
            </div>
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };