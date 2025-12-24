// src/components/molecules/badge-menu.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Badge, BadgeProps } from "@/components/atoms/badge";
import { Text } from "@/components/atoms/text";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgeMenuItem {
  value: string;
  label: string;
  color?: string;
  disabled?: boolean;
}

interface BadgeMenuProps extends Omit<BadgeProps, 'onSelect'> {
  items: BadgeMenuItem[];
  value?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  className?: string;
  badgeClassName?: string;
}

export function BadgeMenu({
  items,
  value,
  onSelect,
  placeholder = "Select",
  className,
  badgeClassName,
  variant = "outline",
  ...badgeProps
}: BadgeMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyles, setMenuStyles] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedItem = items.find(item => item.value === value);

  // Calculate menu position relative to trigger
  const updateMenuPosition = useCallback(() => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const menuHeight = 180;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUp = spaceBelow < menuHeight && spaceAbove > spaceBelow;

    setMenuStyles({
      position: 'fixed',
      left: rect.left,
      top: openUp ? rect.top - menuHeight - 4 : rect.bottom + 4,
      minWidth: Math.max(rect.width, 128),
      zIndex: 9999,
    });
  }, []);

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

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
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

  const getBadgeStyle = (color?: string) => {
    if (color) return { backgroundColor: color, borderColor: color };
    return {};
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const handleSelect = (e: React.MouseEvent, itemValue: string) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect(itemValue);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)} ref={triggerRef}>
      <Badge
        variant={variant}
        className={cn(
          "cursor-pointer gap-1 hover:opacity-90",
          badgeClassName
        )}
        style={selectedItem ? getBadgeStyle(selectedItem.color) : undefined}
        onClick={handleToggle}
        {...badgeProps}
      >
        <span>{selectedItem?.label || placeholder}</span>
        <ChevronDown className={cn(
          "h-3 w-3 transition-transform",
          isOpen && "rotate-180"
        )} />
      </Badge>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          className="rounded-lg border border-gray-200 bg-white p-1.5 shadow-xl dark:border-gray-800 dark:bg-gray-900"
          style={menuStyles}
        >
          {items.map((item) => (
            <button
              key={item.value}
              type="button"
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white",
                value === item.value && "bg-gray-100 dark:bg-gray-800",
                item.disabled && "pointer-events-none opacity-50"
              )}
              onClick={(e) => handleSelect(e, item.value)}
              disabled={item.disabled}
            >
              <div className="flex items-center gap-2">
                {item.color && (
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                )}
                <Text variant="body" className="text-sm">
                  {item.label}
                </Text>
              </div>
              {value === item.value && (
                <Check className="h-3 w-3" />
              )}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}