// src/components/molecules/sprint-view-tabs.tsx
"use client";

import { 
  LayoutGrid, 
  LayoutList, 
  Table as TableIcon,
  Calendar as CalendarIcon,
  GanttChart 
} from "lucide-react";

export type ViewType = "board" | "list" | "table" | "calendar" | "gantt";

interface SprintViewTabsProps {
  view: ViewType;
  onViewChange: (view: ViewType) => void;
}

const viewTabs = [
  { value: "list" as ViewType, label: "List", icon: <LayoutList className="h-4 w-4" /> },
  { value: "board" as ViewType, label: "Board", icon: <LayoutGrid className="h-4 w-4" /> },
  { value: "calendar" as ViewType, label: "Calendar", icon: <CalendarIcon className="h-4 w-4" /> },
  { value: "gantt" as ViewType, label: "Gantt", icon: <GanttChart className="h-4 w-4" /> },
  { value: "table" as ViewType, label: "Table", icon: <TableIcon className="h-4 w-4" /> },
];

export function SprintViewTabs({ view, onViewChange }: SprintViewTabsProps) {
  return (
    <div className="border-b border-border/50">
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
        {viewTabs.map((tab) => {
          const isActive = view === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => onViewChange(tab.value)}
              className={`
                relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200
                whitespace-nowrap
                ${isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
                }
              `}
            >
              <span className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}