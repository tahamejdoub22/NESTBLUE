"use client";

import { cn } from "@/lib/utils";
import { Check, ChevronDown, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "../atoms";

export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  maxDisplay?: number;
  className?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  disabled = false,
  maxDisplay = 3,
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOptions = options.filter((opt) => value.includes(opt.value));
  const displayOptions = selectedOptions.slice(0, maxDisplay);
  const remainingCount = selectedOptions.length - maxDisplay;

  const toggleOption = (optionValue: string) => {
    if (disabled) return;
    
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const removeOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "flex min-h-10 w-full cursor-pointer items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors hover:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600",
          isOpen && "ring-2 ring-primary-500 ring-offset-2",
          disabled && "cursor-not-allowed opacity-50"
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {selectedOptions.length === 0 ? (
            <span className="text-gray-500 dark:text-gray-400">{placeholder}</span>
          ) : (
            <>
              {displayOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="gap-1 pr-1"
                >
                  {option.label}
                  <button
                    type="button"
                    onClick={(e) => removeOption(option.value, e)}
                    className="ml-1 rounded-full outline-none hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {remainingCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  +{remainingCount} more
                </Badge>
              )}
            </>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-gray-500 transition-transform dark:text-gray-400",
            isOpen && "rotate-180"
          )}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-800 dark:bg-gray-900">
          {options.map((option) => (
            <div
              key={option.value}
              className={cn(
                "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white",
                value.includes(option.value) && "bg-gray-100 dark:bg-gray-800",
                option.disabled && "pointer-events-none opacity-50"
              )}
              onClick={() => !option.disabled && toggleOption(option.value)}
            >
              <div className="mr-2 flex h-4 w-4 items-center justify-center">
                {value.includes(option.value) && (
                  <Check className="h-3 w-3 text-primary-600 dark:text-primary-400" />
                )}
              </div>
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}