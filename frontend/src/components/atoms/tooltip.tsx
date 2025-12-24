"use client";

import { cn } from "@/lib/utils";
import {
  createContext,
  forwardRef,
  HTMLAttributes,
  ReactNode,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { createPortal } from "react-dom";

interface TooltipContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  delayDuration: number;
}

const TooltipContext = createContext<TooltipContextValue | undefined>(undefined);

const useTooltip = () => {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error("Tooltip components must be used within TooltipProvider");
  }
  return context;
};

export interface TooltipProviderProps {
  children: ReactNode;
  delayDuration?: number;
}

export function TooltipProvider({
  children,
  delayDuration = 200,
}: TooltipProviderProps) {
  const [open, setOpen] = useState(false);

  return (
    <TooltipContext.Provider value={{ open, setOpen, delayDuration }}>
      {children}
    </TooltipContext.Provider>
  );
}

export interface TooltipProps {
  children: ReactNode;
}

export function Tooltip({ children }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [delayDuration] = useState(200);

  return (
    <TooltipContext.Provider value={{ open, setOpen, delayDuration }}>
      {children}
    </TooltipContext.Provider>
  );
}

export interface TooltipTriggerProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export const TooltipTrigger = forwardRef<HTMLDivElement, TooltipTriggerProps>(
  ({ className, children, asChild, ...props }, ref) => {
    const { setOpen, delayDuration } = useTooltip();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
      timeoutRef.current = setTimeout(() => setOpen(true), delayDuration);
    };

    const handleMouseLeave = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setOpen(false);
    };

    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    if (asChild && typeof children === "object" && children !== null && "props" in children) {
      const child = children as React.ReactElement;
      return (
        <div
          ref={ref}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={cn(className)}
          {...props}
        >
          {child}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TooltipTrigger.displayName = "TooltipTrigger";

export interface TooltipContentProps extends HTMLAttributes<HTMLDivElement> {
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

export const TooltipContent = forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, children, side = "top", sideOffset = 4, ...props }, ref) => {
    const { open } = useTooltip();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    if (!open || !mounted) return null;

    return createPortal(
      <div
        ref={ref}
        role="tooltip"
        className={cn(
          "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
          "animate-in fade-in-0 zoom-in-95",
          side === "top" && "slide-in-from-bottom-2",
          side === "bottom" && "slide-in-from-top-2",
          side === "left" && "slide-in-from-right-2",
          side === "right" && "slide-in-from-left-2",
          className
        )}
        style={{
          position: "fixed",
          pointerEvents: "none",
        }}
        {...props}
      >
        {children}
      </div>,
      document.body
    );
  }
);

TooltipContent.displayName = "TooltipContent";
