// src/components/molecules/dropdown.tsx
"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/atoms/badge";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect, ReactElement, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

export interface DropdownItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: number;
}

interface DropdownProps {
  items: DropdownItem[];
  value?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  trigger?: ReactElement;
  triggerClassName?: string;
  align?: "left" | "right" | "center";
  contentClassName?: string;
}

export function Dropdown({
  items,
  value,
  onSelect,
  placeholder = "Select an option...",
  disabled = false,
  className,
  trigger,
  triggerClassName,
  align = "left",
  contentClassName,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyles, setMenuStyles] = useState<React.CSSProperties>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedItem = items.find((item) => item.value === value);

  // Calculate menu position using fixed positioning
  const updateMenuPosition = useCallback(() => {
    if (!triggerRef.current) return;

    // Try to find the actual button element inside the wrapper
    const buttonElement = triggerRef.current.querySelector('button') as HTMLElement;
    const elementToMeasure = buttonElement || triggerRef.current;
    
    const rect = elementToMeasure.getBoundingClientRect();
    const minWidth = 160; // Minimum width for dropdown
    const menuWidth = Math.max(rect.width, minWidth);
    const menuHeight = Math.min(items.length * 40 + 8, 240); // Estimate menu height
    const padding = 8; // Padding from viewport edges

    // Calculate horizontal position
    let left = rect.left;
    if (align === "right") {
      left = rect.right - menuWidth;
    } else if (align === "center") {
      left = rect.left + (rect.width - menuWidth) / 2;
    }

    // Ensure dropdown doesn't go off-screen horizontally
    if (left < padding) {
      left = padding;
    } else if (left + menuWidth > window.innerWidth - padding) {
      left = window.innerWidth - menuWidth - padding;
    }

    // Calculate vertical position (try below first, then above if needed)
    let top = rect.bottom + 4;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    // If not enough space below, show above
    if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
      top = rect.top - menuHeight - 4;
    }

    // Ensure dropdown doesn't go off-screen vertically
    if (top < padding) {
      top = padding;
    } else if (top + menuHeight > window.innerHeight - padding) {
      top = window.innerHeight - menuHeight - padding;
    }

    setMenuStyles({
      position: 'fixed',
      left: `${left}px`,
      top: `${top}px`,
      width: `${menuWidth}px`,
      zIndex: 99999, // Very high z-index to ensure it's above everything
    });
  }, [align, items.length]);

  // Handle trigger click
  const handleTriggerClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  }, [disabled]);

  // Update position when opening
  useEffect(() => {
    if (isOpen) {
      updateMenuPosition();
      window.addEventListener('scroll', updateMenuPosition, true);
      window.addEventListener('resize', updateMenuPosition);
      return () => {
        window.removeEventListener('scroll', updateMenuPosition, true);
        window.removeEventListener('resize', updateMenuPosition);
      };
    }
  }, [isOpen, updateMenuPosition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        menuRef.current && !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Render default trigger if no custom trigger is provided
  const renderDefaultTrigger = () => (
    <button
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600",
        "disabled:cursor-not-allowed disabled:opacity-50",
        triggerClassName
      )}
      onClick={() => !disabled && setIsOpen(!isOpen)}
      disabled={disabled}
    >
      <div className="flex items-center gap-2">
        {selectedItem?.icon}
        <span className={cn(!selectedItem && "text-gray-500 dark:text-gray-400")}>
          {selectedItem?.label || placeholder}
        </span>
      </div>
      <ChevronDown
        className={cn(
          "h-4 w-4 text-gray-500 transition-transform dark:text-gray-400",
          isOpen && "rotate-180"
        )}
      />
    </button>
  );

  // Clone trigger with onClick handler
  const triggerWithHandler = trigger ? (
    <div 
      ref={triggerRef} 
      className="inline-block"
      onClick={handleTriggerClick}
      onMouseDown={(e) => {
        // Prevent default to avoid conflicts
        if (!disabled) {
          e.preventDefault();
        }
      }}
    >
      {trigger}
    </div>
  ) : null;

  return (
    <div className={cn("relative inline-block", trigger ? "" : "w-full", className)} ref={dropdownRef}>
      {/* Render custom trigger or default */}
      {trigger ? (
        triggerWithHandler
      ) : (
        <div ref={triggerRef}>
          {renderDefaultTrigger()}
        </div>
      )}

      {/* Render menu with portal and animations */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={menuRef}
              style={menuStyles}
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className={cn(
                "max-h-60 min-w-[10rem] overflow-y-auto rounded-lg border border-border/40 bg-popover p-1 shadow-xl",
                "backdrop-blur-sm",
                "z-[99999]",
                contentClassName
              )}
              onMouseDown={(e) => {
                // Prevent closing when clicking inside menu
                e.stopPropagation();
              }}
            >
              {items.map((item, index) => (
                <motion.button
                  key={item.value}
                  type="button"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02, duration: 0.1 }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-all duration-150",
                    "hover:bg-primary/10 hover:text-primary",
                    "focus:bg-primary/10 focus:text-primary focus:outline-none",
                    value === item.value && "bg-primary/10 text-primary font-medium",
                    item.disabled && "pointer-events-none opacity-50 cursor-not-allowed"
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!item.disabled) {
                      onSelect(item.value);
                      setIsOpen(false);
                    }
                  }}
                  disabled={item.disabled}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge
                      variant="destructive"
                      className="h-5 min-w-5 px-1.5 text-[10px] font-bold flex-shrink-0"
                    >
                      {item.badge > 99 ? "99+" : item.badge}
                    </Badge>
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}