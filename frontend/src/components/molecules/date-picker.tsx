// src/components/molecules/date-picker.tsx
"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { Input } from "@/components/atoms/input";
import { Button } from "@/components/atoms/button";
import { Text } from "@/components/atoms/text";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  format?: string;
  minDate?: Date;
  maxDate?: Date;
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  disabled = false,
  className,
  format = "MMM dd, yyyy",
  minDate,
  maxDate,
}: DatePickerProps) {
  // Convert value to Date object if it's a string
  // This needs to be computed on every render to handle prop changes
  let validDate: Date | undefined = undefined;
  if (value) {
    if (value instanceof Date) {
      validDate = !isNaN(value.getTime()) ? value : undefined;
    } else {
      // Try to convert string to Date
      const parsed = new Date(value as any);
      validDate = !isNaN(parsed.getTime()) ? parsed : undefined;
    }
  }
  
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(validDate ? validDate.getMonth() : new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(validDate ? validDate.getFullYear() : new Date().getFullYear());
  const [menuStyles, setMenuStyles] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Update current month/year when value changes
  useEffect(() => {
    if (validDate) {
      setCurrentMonth(validDate.getMonth());
      setCurrentYear(validDate.getFullYear());
    }
  }, [validDate]);

  // Calculate menu position
  const updateMenuPosition = useCallback(() => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const isMobile = window.innerWidth < 640;
    const menuHeight = isMobile ? 280 : 320;
    const menuWidth = isMobile ? 240 : 256;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceRight = window.innerWidth - rect.left;
    const openUp = spaceBelow < menuHeight && rect.top > spaceBelow;
    const openLeft = spaceRight < menuWidth && rect.right > menuWidth;

    setMenuStyles({
      position: 'fixed',
      left: openLeft ? rect.right - menuWidth : rect.left,
      top: openUp ? rect.top - menuHeight - 4 : rect.bottom + 4,
      zIndex: 9999,
      width: isMobile ? '240px' : '256px',
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

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return "";
    
    // Convert to Date object if it's a string
    const dateObj = date instanceof Date 
      ? date 
      : new Date(date as any);
    
    // Validate the date
    if (isNaN(dateObj.getTime())) return "";
    
    const day = dateObj.getDate();
    const month = dateObj.getMonth();
    const year = dateObj.getFullYear();

    // Default sprint format: "12 Dec 2025"
    if (format === "MMM dd, yyyy") {
      const dayStr = day < 10 ? `0${day}` : String(day);
      const monthStr = months[month].substring(0, 3);
      return `${dayStr} ${monthStr} ${year}`;
    }

    // Fallback format
    return `${month + 1}/${day}/${year}`;
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentYear, currentMonth - 1, 1);
    if (minDate && newDate < new Date(minDate.getFullYear(), minDate.getMonth(), 1)) {
      return; // Can't go before minDate
    }
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentYear, currentMonth + 1, 1);
    if (maxDate && newDate > new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)) {
      return; // Can't go after maxDate
    }
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleYearChange = (year: number) => {
    const newDate = new Date(year, currentMonth, 1);
    if (minDate && newDate < new Date(minDate.getFullYear(), minDate.getMonth(), 1)) {
      setCurrentYear(minDate.getFullYear());
      setCurrentMonth(minDate.getMonth());
    } else if (maxDate && newDate > new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)) {
      setCurrentYear(maxDate.getFullYear());
      setCurrentMonth(maxDate.getMonth());
    } else {
      setCurrentYear(year);
    }
  };

  // Get available years based on min/max dates
  const getAvailableYears = () => {
    const currentYearNum = new Date().getFullYear();
    const minYear = minDate ? minDate.getFullYear() : currentYearNum - 10;
    const maxYear = maxDate ? maxDate.getFullYear() : currentYearNum + 10;
    const years = [];
    for (let year = minYear; year <= maxYear; year++) {
      years.push(year);
    }
    return years;
  };

  const handleToday = () => {
    const today = new Date();
    onChange(today);
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(undefined);
    setIsOpen(false);
  };

  const handleDateSelect = (date: Date) => {
    if (disabled) return;
    // Normalize dates to compare only the date part (without time)
    const normalizeDate = (d: Date): Date => {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    };
    const normalizedDate = normalizeDate(date);
    // Validate against min/max dates
    if (minDate) {
      const normalizedMin = normalizeDate(minDate);
      if (normalizedDate < normalizedMin) {
        return; // Date is before minDate
      }
    }
    if (maxDate) {
      const normalizedMax = normalizeDate(maxDate);
      if (normalizedDate > normalizedMax) {
        return; // Date is after maxDate
      }
    }
    onChange(date);
    setIsOpen(false);
  };

  // Check if a date is disabled
  // Normalize dates to compare only the date part (without time)
  const normalizeDate = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  const isDateDisabled = (date: Date): boolean => {
    if (disabled) return true;
    const normalizedDate = normalizeDate(date);
    if (minDate) {
      const normalizedMin = normalizeDate(minDate);
      if (normalizedDate < normalizedMin) return true;
    }
    if (maxDate) {
      const normalizedMax = normalizeDate(maxDate);
      if (normalizedDate > normalizedMax) return true;
    }
    return false;
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Previous month days
    const prevMonthDays = getDaysInMonth(currentMonth - 1, currentYear);
    for (let i = 0; i < firstDay; i++) {
      const day = prevMonthDays - firstDay + i + 1;
      days.push({
        day,
        isCurrentMonth: false,
        date: new Date(currentYear, currentMonth - 1, day)
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(currentYear, currentMonth, i)
      });
    }

    // Next month days
    const totalCells = 42; // 6 weeks
    const nextMonthDays = totalCells - days.length;
    for (let i = 1; i <= nextMonthDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(currentYear, currentMonth + 1, i)
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="relative w-full" ref={triggerRef}>
      <Input
        value={validDate ? formatDate(validDate) : ""}
        placeholder={placeholder}
        readOnly
        leftIcon={<Calendar className="h-4 w-4" />}
        rightIcon={
          validDate ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleClear(); }}
              className="hover:text-gray-700 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null
        }
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn("cursor-pointer", className)}
        disabled={disabled}
      />

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          className="rounded-lg border border-gray-200 bg-white p-2 sm:p-3 shadow-xl dark:border-gray-800 dark:bg-gray-900"
          style={menuStyles}
        >
          {/* Calendar Header */}
          <div className="mb-2 sm:mb-3 flex items-center justify-between">
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevMonth}
                disabled={minDate && new Date(currentYear, currentMonth - 1, 1) < new Date(minDate.getFullYear(), minDate.getMonth(), 1)}
                className="h-6 w-6 sm:h-7 sm:w-7 p-0 touch-manipulation"
              >
                <ChevronLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </Button>
              <div className="flex items-center gap-1">
                <select
                  value={currentMonth}
                  onChange={(e) => {
                    const newMonth = parseInt(e.target.value);
                    const newDate = new Date(currentYear, newMonth, 1);
                    if (minDate && newDate < new Date(minDate.getFullYear(), minDate.getMonth(), 1)) {
                      setCurrentMonth(minDate.getMonth());
                      setCurrentYear(minDate.getFullYear());
                    } else if (maxDate && newDate > new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)) {
                      setCurrentMonth(maxDate.getMonth());
                      setCurrentYear(maxDate.getFullYear());
                    } else {
                      setCurrentMonth(newMonth);
                    }
                  }}
                  className="text-[10px] sm:text-xs font-semibold bg-transparent border-none outline-none cursor-pointer px-1"
                >
                  {months.map((month, idx) => {
                    const monthDate = new Date(currentYear, idx, 1);
                    const isDisabled = (minDate && monthDate < new Date(minDate.getFullYear(), minDate.getMonth(), 1)) ||
                                     (maxDate && monthDate > new Date(maxDate.getFullYear(), maxDate.getMonth(), 1));
                    return (
                      <option key={idx} value={idx} disabled={isDisabled}>
                        {month.substring(0, 3)}
                      </option>
                    );
                  })}
                </select>
                <select
                  value={currentYear}
                  onChange={(e) => handleYearChange(parseInt(e.target.value))}
                  className="text-[10px] sm:text-xs font-semibold bg-transparent border-none outline-none cursor-pointer px-1"
                >
                  {getAvailableYears().map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextMonth}
                disabled={maxDate && new Date(currentYear, currentMonth + 1, 1) > new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)}
                className="h-6 w-6 sm:h-7 sm:w-7 p-0 touch-manipulation"
              >
                <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToday}
              disabled={minDate && new Date() < minDate || maxDate && new Date() > maxDate}
              className="h-6 sm:h-7 px-1.5 sm:px-2 text-[10px] sm:text-xs touch-manipulation"
            >
              Today
            </Button>
          </div>

          {/* Weekday Headers */}
          <div className="mb-1 sm:mb-1.5 grid grid-cols-7 gap-0.5">
            {weekdays.map((day) => (
              <div
                key={day}
                className="text-center text-[9px] sm:text-[10px] font-medium text-gray-500 dark:text-gray-400"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-0.5">
            {calendarDays.map(({ day, isCurrentMonth, date }, index) => {
              const isToday = new Date().toDateString() === date.toDateString();
              const isSelected = validDate && validDate.toDateString() === date.toDateString();
              const isDisabled = isDateDisabled(date);

              return (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => !isDisabled && handleDateSelect(date)}
                  disabled={isDisabled}
                  className={cn(
                    "h-6 w-6 sm:h-7 sm:w-7 p-0 text-[10px] sm:text-[11px] font-medium touch-manipulation",
                    !isCurrentMonth && "text-gray-400 dark:text-gray-600",
                    isToday && !isDisabled && "border border-primary-500 font-semibold",
                    isSelected && "bg-primary text-white hover:bg-primary/90 font-semibold",
                    isCurrentMonth && !isSelected && !isDisabled && "hover:bg-gray-100 dark:hover:bg-gray-800",
                    isDisabled && "opacity-30 cursor-not-allowed"
                  )}
                >
                  {day}
                </Button>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-2 sm:mt-3 flex justify-end gap-1 sm:gap-1.5 border-t border-gray-100 pt-2 sm:pt-2.5 dark:border-gray-800">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 sm:h-7 px-2 sm:px-2.5 text-[10px] sm:text-xs touch-manipulation"
            >
              Clear
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 sm:h-7 px-2 sm:px-2.5 text-[10px] sm:text-xs touch-manipulation"
            >
              Close
            </Button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}