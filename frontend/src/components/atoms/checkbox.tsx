import { cn } from "@/lib/utils";
import { forwardRef, InputHTMLAttributes } from "react";
import { Check, Minus } from "lucide-react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, indeterminate, onCheckedChange, onChange, ...props }, ref) => {
    return (
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          ref={ref}
          className="peer sr-only"
          onChange={(e) => {
            onChange?.(e);
            onCheckedChange?.(e.target.checked);
          }}
          {...props}
        />
        <div
          className={cn(
            "h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background",
            "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            "peer-checked:bg-primary peer-checked:text-primary-foreground",
            "transition-all duration-200",
            "flex items-center justify-center",
            className
          )}
        >
          {indeterminate ? (
            <Minus className="h-3 w-3 text-primary-foreground flex-shrink-0" />
          ) : (
            <Check className="h-3 w-3 text-primary-foreground opacity-0 peer-checked:opacity-100 flex-shrink-0" />
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
