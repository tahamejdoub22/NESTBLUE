"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

interface SelectContextType {
  value?: string;
  onValueChange: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLabel?: string;
  setSelectedLabel: (label: string) => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
  itemsRef?: React.MutableRefObject<Map<string, string>>;
}

const SelectContext = React.createContext<SelectContextType | undefined>(undefined);

interface SelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export function Select({ value, onValueChange, children, disabled }: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedLabel, setSelectedLabel] = React.useState<string>("");
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const itemsRef = React.useRef<Map<string, string>>(new Map());

  // Update selected label when value changes
  React.useEffect(() => {
    if (value && itemsRef.current.has(value)) {
      setSelectedLabel(itemsRef.current.get(value) || value);
    } else if (value) {
      setSelectedLabel(value);
    } else {
      setSelectedLabel("");
    }
  }, [value]);

  return (
    <SelectContext.Provider value={{ 
      value, 
      onValueChange, 
      open, 
      onOpenChange: setOpen,
      selectedLabel,
      setSelectedLabel,
      triggerRef,
      itemsRef
    }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  id?: string;
}

export function SelectTrigger({ children, className, id, ...props }: SelectTriggerProps) {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("SelectTrigger must be used within a Select");
  }

  return (
    <button
      ref={context.triggerRef}
      type="button"
      id={id}
      onClick={() => !props.disabled && context.onOpenChange(!context.open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-xl border border-border/40 bg-background px-4 py-2 text-sm font-medium transition-all duration-200 hover:border-border/80 hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20",
        "placeholder:text-muted-foreground/60",
        "disabled:cursor-not-allowed disabled:opacity-50",
        context.open && "border-primary/50 ring-2 ring-primary/10 bg-muted/30",
        className
      )}
      disabled={props.disabled}
      {...props}
    >
      <div className="truncate pr-4">{children}</div>
      <ChevronDown className={cn(
        "h-4 w-4 text-muted-foreground transition-transform duration-200",
        context.open && "rotate-180 text-primary"
      )} />
    </button>
  );
}

interface SelectValueProps {
  children?: React.ReactNode;
  placeholder?: string;
}

export function SelectValue({ children, placeholder }: SelectValueProps) {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("SelectValue must be used within a Select");
  }

  if (children) {
    return <>{children}</>;
  }

  if (context.selectedLabel) {
    return <span>{context.selectedLabel}</span>;
  }

  return <span className="text-muted-foreground">{placeholder || "Select..."}</span>;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export function SelectContent({ children, className }: SelectContentProps) {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("SelectContent must be used within a Select");
  }

  const [position, setPosition] = React.useState<{ top: number; left: number; width: number } | null>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (context.open && context.triggerRef.current) {
      const rect = context.triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [context.open, context.triggerRef]);

  React.useEffect(() => {
    if (!context.open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node) &&
        context.triggerRef.current &&
        !context.triggerRef.current.contains(e.target as Node)
      ) {
        context.onOpenChange(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        context.onOpenChange(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [context]);

  if (!context || !context.open || !position) return null;

  return createPortal(
    <div
      ref={contentRef}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-xl border border-border/40 bg-popover/95 backdrop-blur-xl p-1.5 text-foreground shadow-2xl",
        "animate-in fade-in-0 zoom-in-95 duration-200",
        className
      )}
      style={{
        position: "fixed",
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
        boxShadow: "0 10px 40px -10px rgba(0,0,0,0.15), 0 4px 12px -4px rgba(0,0,0,0.1)",
      }}
    >
      {children}
    </div>,
    document.body
  );
}

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export function SelectItem({ value, children, className, disabled, ...props }: SelectItemProps) {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("SelectItem must be used within a Select");
  }

  const isSelected = context.value === value;

  // Extract label from children
  const getLabel = (): string => {
    if (typeof children === "string") {
      return children;
    }
    if (React.isValidElement(children)) {
      if (typeof children.props?.children === "string") {
        return children.props.children;
      }
      if (Array.isArray(children.props?.children)) {
        return children.props.children.filter((c: any) => typeof c === "string").join("");
      }
    }
    return value;
  };

  const label = getLabel();

  // Register this item
  React.useEffect(() => {
    if (context.itemsRef?.current) {
      context.itemsRef.current.set(value, label);
    }
  }, [value, label, context]);

  const handleClick = () => {
    if (!disabled) {
      context.onValueChange(value);
      context.setSelectedLabel(label);
      context.onOpenChange(false);
    }
  };

  return (
    <div
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-lg py-2 px-3 text-sm font-medium transition-colors outline-none",
        "hover:bg-primary/10 hover:text-primary",
        "focus:bg-primary/10 focus:text-primary",
        isSelected && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  );
}

