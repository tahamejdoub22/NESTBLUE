import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface InputGroupProps {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
  fullWidth?: boolean;
}

export function InputGroup({
  label,
  helperText,
  error,
  required,
  className,
  children,
  fullWidth = false,
}: InputGroupProps) {
  return (
    <div className={cn("space-y-2", fullWidth && "w-full", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-900 dark:text-white">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      {children}
      {(helperText || error) && (
        <p
          className={cn(
            "text-sm",
            error ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"
          )}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
}