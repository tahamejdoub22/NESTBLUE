// src/components/molecules/sprint-group-controls.tsx
"use client";

import { Button } from "@/components/atoms/button";
import { Text } from "@/components/atoms/text";
import { Dropdown } from "./dropdown";
import { 
  Plus, 
  Filter, 
  SortAsc, 
  Settings, 
  Users, 
  AlertCircle,
  LayoutGrid,
  ListTodo
} from "lucide-react";

interface SprintGroupControlsProps {
  onAddTask?: () => void;
}

export function SprintGroupControls({ onAddTask }: SprintGroupControlsProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6 rounded-xl border border-border/50 bg-card/80 backdrop-blur-md p-5 lg:p-6 shadow-md">
      {/* Left Section: Grouping and View Options */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 flex-1">
        {/* Group Badge */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 backdrop-blur-sm">
          <Text variant="body" weight="medium" className="text-xs text-muted-foreground">
            Group by:
          </Text>
          <Text variant="body" weight="semibold" className="text-sm text-primary">
            Status
          </Text>
        </div>
        
        {/* View Toggle Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-muted/30 border border-border/30">
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 px-3 text-xs font-medium hover:bg-accent/60 active:bg-accent transition-colors"
          >
            <ListTodo className="mr-1.5 h-3.5 w-3.5" />
            Subtasks
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 px-3 text-xs font-medium hover:bg-accent/60 active:bg-accent transition-colors"
          >
            <LayoutGrid className="mr-1.5 h-3.5 w-3.5" />
            Columns
          </Button>
        </div>
      </div>
      
      {/* Right Section: Actions */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Filter and Sort Group */}
        <div className="flex items-center gap-2 lg:border-r lg:border-border/30 lg:pr-2.5">
          <Dropdown
            items={[
              { value: "status", label: "Status", icon: <Settings className="h-4 w-4" /> },
              { value: "assignee", label: "Assignee", icon: <Users className="h-4 w-4" /> },
              { value: "priority", label: "Priority", icon: <AlertCircle className="h-4 w-4" /> },
            ]}
            value="status"
            onSelect={() => {}}
            trigger={
              <Button 
                variant="outline" 
                size="sm"
                className="h-9 px-3.5 border-border/50 hover:border-primary/50 hover:bg-accent/60 transition-all font-medium"
              >
                <Filter className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Filter</span>
              </Button>
            }
          />
          
          <Dropdown
            items={[
              { value: "newest", label: "Newest First" },
              { value: "oldest", label: "Oldest First" },
              { value: "priority", label: "Priority" },
              { value: "dueDate", label: "Due Date" },
            ]}
            value="newest"
            onSelect={() => {}}
            trigger={
              <Button 
                variant="outline" 
                size="sm"
                className="h-9 px-3.5 border-border/50 hover:border-primary/50 hover:bg-accent/60 transition-all font-medium"
              >
                <SortAsc className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Sort</span>
              </Button>
            }
          />
        </div>
        
        {/* Settings Button */}
        <Button 
          variant="outline" 
          size="sm"
          className="h-9 w-9 p-0 border-border/50 hover:border-primary/50 hover:bg-accent/60 transition-all"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
        
        {/* Add Task Button */}
        <Button 
          onClick={onAddTask}
          size="sm"
          className="h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all font-medium"
        >
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Add Task</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>
    </div>
  );
}