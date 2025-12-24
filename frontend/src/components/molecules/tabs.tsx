// src/components/molecules/tabs.tsx
"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/atoms/button";
import { Text } from "@/components/atoms/text";
import { createContext, useContext, useState, ReactNode } from "react";

interface TabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  items?: TabItem[];
  className?: string;
  children?: ReactNode;
}

const Tabs = ({ 
  defaultValue, 
  value: controlledValue, 
  onValueChange: controlledOnValueChange,
  items, 
  className,
  children 
}: TabsProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue || "");
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;
  const handleValueChange = (newValue: string) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    controlledOnValueChange?.(newValue);
  };

  // Legacy API with items prop
  if (items) {
    return (
      <div className={cn(
        "flex items-center gap-1 rounded-lg bg-muted p-1",
        "overflow-x-auto scrollbar-hide",
        "scroll-smooth",
        "-mx-1 px-1",
        "md:overflow-visible md:mx-0 md:px-0",
        className
      )}>
        <div className="flex items-center gap-1 min-w-max md:min-w-0 md:w-full">
          {items.map((item) => (
            <Button
              key={item.value}
              variant={currentValue === item.value ? "secondary" : "ghost"}
              size="sm"
              onClick={() => handleValueChange(item.value)}
              className={cn(
                "gap-1.5 md:gap-2",
                "px-3 md:px-3",
                "h-8 md:h-9",
                "flex-shrink-0",
                "whitespace-nowrap",
                "min-w-fit",
                "transition-all duration-200",
                currentValue === item.value && "bg-background shadow-sm"
              )}
            >
              {item.icon && (
                <span className="flex-shrink-0">
                  {item.icon}
                </span>
              )}
              <Text 
                variant="caption" 
                weight="medium"
                className="text-xs sm:text-sm"
              >
                {item.label}
              </Text>
            </Button>
          ))}
        </div>
      </div>
    );
  }

  // Compound component API
  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={cn("space-y-6", className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

const TabsList = ({ children, className }: TabsListProps) => {
  return (
    <div className={cn(
      "flex items-center gap-1 rounded-lg bg-muted p-1",
      "overflow-x-auto scrollbar-hide",
      "scroll-smooth",
      "-mx-1 px-1",
      "md:overflow-visible md:mx-0 md:px-0",
      className
    )}>
      <div className="flex items-center gap-1 min-w-max md:min-w-0 md:w-full">
        {children}
      </div>
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

const TabsTrigger = ({ value, children, className }: TabsTriggerProps) => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("TabsTrigger must be used within Tabs");
  }

  const { value: currentValue, onValueChange } = context;
  const isActive = currentValue === value;

  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      size="sm"
      onClick={() => onValueChange(value)}
      className={cn(
        "gap-1.5 md:gap-2",
        "px-3 md:px-3",
        "h-8 md:h-9",
        "flex-shrink-0",
        "whitespace-nowrap",
        "min-w-fit",
        "transition-all duration-200",
        isActive && "bg-background shadow-sm",
        className
      )}
    >
      {children}
    </Button>
  );
};

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

const TabsContent = ({ value, children, className }: TabsContentProps) => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("TabsContent must be used within Tabs");
  }

  const { value: currentValue } = context;
  
  if (currentValue !== value) {
    return null;
  }

  return (
    <div className={className}>
      {children}
    </div>
  );
};

Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;

export { Tabs };
