// Sprint-related constants - Enhanced Design System
import { TaskStatus, TaskPriority } from "@/components/organisms/sprint-board";
import { User } from "@/components/molecules/avatar-select-group";

// ═══════════════════════════════════════════════════════════════════════════
// STATUS CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export const STATUS_ORDER: readonly TaskStatus[] = ["todo", "in-progress", "complete"] as const;

export const STATUS_LABELS: Record<TaskStatus, string> = {
  "todo": "To Do",
  "in-progress": "In Progress",
  "complete": "Complete",
  "backlog": "Backlog"
};

export const STATUS_ICONS: Record<TaskStatus, string> = {
  "todo": "Circle",
  "in-progress": "Clock",
  "complete": "CheckCircle2",
  "backlog": "Archive"
};

export const STATUS_COLORS = {
  todo: {
    // Core colors
    bg: "bg-info-500",
    border: "border-info-200 dark:border-info-800",
    text: "text-info-700 dark:text-info-300",
    // Light backgrounds
    bgLight: "bg-info-50 dark:bg-info-950/40",
    bgSubtle: "bg-info-100/50 dark:bg-info-900/30",
    // Gradients
    gradient: "bg-gradient-to-br from-info-50 via-info-100/80 to-info-50 dark:from-info-950/50 dark:via-info-900/40 dark:to-info-950/50",
    borderGradient: "border-info-200/60 dark:border-info-800/40",
    // Interactive states
    dot: "bg-info-500",
    dotPulse: "bg-info-400",
    hover: "hover:border-info-400 dark:hover:border-info-600",
    hoverBg: "hover:bg-info-50 dark:hover:bg-info-950/50",
    // Ring & Focus
    ring: "ring-info-500/30",
    focus: "focus:ring-info-500",
    // Badge
    badge: "bg-info-100 text-info-700 dark:bg-info-900/50 dark:text-info-300",
    badgeBorder: "border-info-200 dark:border-info-800",
  },
  "in-progress": {
    bg: "bg-warning-500",
    border: "border-warning-200 dark:border-warning-800",
    text: "text-warning-700 dark:text-warning-300",
    bgLight: "bg-warning-50 dark:bg-warning-950/40",
    bgSubtle: "bg-warning-100/50 dark:bg-warning-900/30",
    gradient: "bg-gradient-to-br from-warning-50 via-warning-100/80 to-warning-50 dark:from-warning-950/50 dark:via-warning-900/40 dark:to-warning-950/50",
    borderGradient: "border-warning-200/60 dark:border-warning-800/40",
    dot: "bg-warning-500",
    dotPulse: "bg-warning-400",
    hover: "hover:border-warning-400 dark:hover:border-warning-600",
    hoverBg: "hover:bg-warning-50 dark:hover:bg-warning-950/50",
    ring: "ring-warning-500/30",
    focus: "focus:ring-warning-500",
    badge: "bg-warning-100 text-warning-700 dark:bg-warning-900/50 dark:text-warning-300",
    badgeBorder: "border-warning-200 dark:border-warning-800",
  },
  complete: {
    bg: "bg-success-500",
    border: "border-success-200 dark:border-success-800",
    text: "text-success-700 dark:text-success-300",
    bgLight: "bg-success-50 dark:bg-success-950/40",
    bgSubtle: "bg-success-100/50 dark:bg-success-900/30",
    gradient: "bg-gradient-to-br from-success-50 via-success-100/80 to-success-50 dark:from-success-950/50 dark:via-success-900/40 dark:to-success-950/50",
    borderGradient: "border-success-200/60 dark:border-success-800/40",
    dot: "bg-success-500",
    dotPulse: "bg-success-400",
    hover: "hover:border-success-400 dark:hover:border-success-600",
    hoverBg: "hover:bg-success-50 dark:hover:bg-success-950/50",
    ring: "ring-success-500/30",
    focus: "focus:ring-success-500",
    badge: "bg-success-100 text-success-700 dark:bg-success-900/50 dark:text-success-300",
    badgeBorder: "border-success-200 dark:border-success-800",
  },
  backlog: {
    bg: "bg-secondary-500",
    border: "border-secondary-200 dark:border-secondary-800",
    text: "text-secondary-700 dark:text-secondary-300",
    bgLight: "bg-secondary-50 dark:bg-secondary-950/40",
    bgSubtle: "bg-secondary-100/50 dark:bg-secondary-900/30",
    gradient: "bg-gradient-to-br from-secondary-50 via-secondary-100/80 to-secondary-50 dark:from-secondary-950/50 dark:via-secondary-900/40 dark:to-secondary-950/50",
    borderGradient: "border-secondary-200/60 dark:border-secondary-800/40",
    dot: "bg-secondary-500",
    dotPulse: "bg-secondary-400",
    hover: "hover:border-secondary-400 dark:hover:border-secondary-600",
    hoverBg: "hover:bg-secondary-50 dark:hover:bg-secondary-950/50",
    ring: "ring-secondary-500/30",
    focus: "focus:ring-secondary-500",
    badge: "bg-secondary-100 text-secondary-700 dark:bg-secondary-900/50 dark:text-secondary-300",
    badgeBorder: "border-secondary-200 dark:border-secondary-800",
  }
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// PRIORITY CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export const PRIORITY_ORDER: readonly TaskPriority[] = ["urgent", "high", "medium", "low"] as const;

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low"
};

export const PRIORITY_COLORS = {
  urgent: {
    icon: "text-destructive-500",
    iconBg: "bg-destructive-100 dark:bg-destructive-950/50",
    bg: "bg-destructive-50 dark:bg-destructive-950/30",
    border: "border-destructive-200 dark:border-destructive-800",
    text: "text-destructive-700 dark:text-destructive-300",
    badge: "bg-destructive-100 text-destructive-700 dark:bg-destructive-900/50 dark:text-destructive-300",
    dot: "bg-destructive-500",
    ring: "ring-destructive-500/30",
  },
  high: {
    icon: "text-warning-600",
    iconBg: "bg-warning-100 dark:bg-warning-950/50",
    bg: "bg-warning-50 dark:bg-warning-950/30",
    border: "border-warning-200 dark:border-warning-800",
    text: "text-warning-700 dark:text-warning-300",
    badge: "bg-warning-100 text-warning-700 dark:bg-warning-900/50 dark:text-warning-300",
    dot: "bg-warning-500",
    ring: "ring-warning-500/30",
  },
  medium: {
    icon: "text-info-500",
    iconBg: "bg-info-100 dark:bg-info-950/50",
    bg: "bg-info-50 dark:bg-info-950/30",
    border: "border-info-200 dark:border-info-800",
    text: "text-info-700 dark:text-info-300",
    badge: "bg-info-100 text-info-700 dark:bg-info-900/50 dark:text-info-300",
    dot: "bg-info-500",
    ring: "ring-info-500/30",
  },
  low: {
    icon: "text-success-500",
    iconBg: "bg-success-100 dark:bg-success-950/50",
    bg: "bg-success-50 dark:bg-success-950/30",
    border: "border-success-200 dark:border-success-800",
    text: "text-success-700 dark:text-success-300",
    badge: "bg-success-100 text-success-700 dark:bg-success-900/50 dark:text-success-300",
    dot: "bg-success-500",
    ring: "ring-success-500/30",
  }
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT USERS
// ═══════════════════════════════════════════════════════════════════════════

export const DEFAULT_AVAILABLE_USERS: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    avatarUrl: "https://github.com/shadcn.png",
    role: "Frontend Developer",
    status: "online"
  },
  {
    id: "2",
    name: "Sarah Smith",
    email: "sarah@example.com",
    avatarUrl: "https://github.com/shadcn.png",
    role: "UI Designer",
    status: "away"
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike@example.com",
    avatarUrl: "https://github.com/shadcn.png",
    role: "Backend Developer",
    status: "busy"
  },
  {
    id: "4",
    name: "Emma Wilson",
    email: "emma@example.com",
    avatarUrl: "https://github.com/shadcn.png",
    role: "Product Manager",
    status: "online"
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// UI TEXT CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

export const UI_TEXT = {
  buttons: {
    addTask: "Add Task",
    cancel: "Cancel",
    save: "Save",
    saveTask: "Save Task",
    addSubtask: "Add subtask",
    inviteTeam: "Invite Team",
    addChannel: "Add Channel",
    expand: "Expand",
    collapse: "Collapse",
    viewAll: "View All",
    showMore: "Show More",
    showLess: "Show Less",
  },
  placeholders: {
    taskInput: "What needs to be done?",
    taskInputHint: "Press Enter to save, Esc to cancel",
    assignTo: "Assign to...",
    searchMembers: "Search team members...",
    selectDate: "Select due date",
    addComment: "Add a comment...",
    unassigned: "Unassigned",
    setDate: "Set date",
    search: "Search...",
    noResults: "No results found",
  },
  labels: {
    assignee: "Assignee",
    dueDate: "Due Date",
    priority: "Priority",
    status: "Status",
    comments: "Comments",
    task: "Task",
    taskNumber: "#",
    assignTo: "Assign to",
    setDueDate: "Set Due Date",
    setPriority: "Set Priority",
    changeStatus: "Change Status",
    subtasks: "Subtasks",
    attachments: "Attachments",
    description: "Description",
    created: "Created",
    updated: "Updated",
  },
  emptyStates: {
    noTasks: (status: string) => `No tasks in ${status}`,
    dragHint: "Click to add a task or drag tasks here",
    addAnother: (status: string) => `Add another task to ${status}`,
    saveHint: "Press Enter to save",
    cancelHint: "Press Esc to cancel",
    noAssignees: "No team members assigned",
    noDueDate: "No due date set",
  },
  taskInfo: {
    assigned: (count: number) => count === 1 ? "1 assigned" : `${count} assigned`,
    taskCount: (count: number) => count === 1 ? "1 task" : `${count} tasks`,
    subtaskProgress: (completed: number, total: number) => `${completed}/${total}`,
    dueToday: "Due today",
    overdue: "Overdue",
    dueSoon: "Due soon",
  },
  tooltips: {
    dragToReorder: "Drag to reorder",
    clickToEdit: "Click to edit",
    addAssignee: "Add assignee",
    setDueDate: "Set due date",
    changePriority: "Change priority",
    changeStatus: "Change status",
    moreOptions: "More options",
  },
  notifications: {
    taskCreated: "Task created successfully",
    taskUpdated: "Task updated",
    taskDeleted: "Task deleted",
    taskMoved: "Task moved",
  }
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATION & TIMING
// ═══════════════════════════════════════════════════════════════════════════

export const ANIMATION = {
  durations: {
    instant: 0,
    fast: 150,
    normal: 250,
    slow: 400,
    slower: 600,
  },
  delays: {
    stagger: 50,
    tooltip: 300,
    debounce: 150,
  },
  transitions: {
    all: "transition-all",
    colors: "transition-colors",
    transform: "transition-transform",
    opacity: "transition-opacity",
    shadow: "transition-shadow",
  },
  easings: {
    default: "ease-out",
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// LAYOUT CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

export const LAYOUT = {
  // Responsive grid: checkbox, drag, title, assignee, date, priority, status, comments
  gridColumns: "grid grid-cols-[auto_auto_1fr_auto_auto_auto_auto_auto] md:grid-cols-[auto_auto_minmax(200px,1fr)_140px_120px_100px_110px_80px]",
  gridColumnsCompact: "grid grid-cols-[auto_auto_1fr_auto] md:grid-cols-[auto_auto_1fr_100px_100px_80px]",
  spacing: {
    section: "space-y-6",
    card: "space-y-4",
    row: "space-y-2",
    inline: "gap-3",
    tight: "gap-2",
    loose: "gap-4",
  },
  padding: {
    section: "p-6",
    card: "p-4",
    cardCompact: "px-4 py-3",
    compact: "p-3",
    button: "px-4 py-2",
  },
  borderRadius: {
    none: "rounded-none",
    xs: "rounded",
    small: "rounded-md",
    medium: "rounded-lg",
    large: "rounded-xl",
    xl: "rounded-2xl",
    full: "rounded-full",
  },
  maxWidth: {
    content: "max-w-7xl",
    form: "max-w-lg",
    modal: "max-w-2xl",
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// TASK DEFAULTS
// ═══════════════════════════════════════════════════════════════════════════

export const TASK_DEFAULTS = {
  priority: "medium" as TaskPriority,
  status: "todo" as TaskStatus,
  dueDateOffset: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  comments: 0,
  attachments: 0,
  uid: "temp-uid", // Temporary constant until backend provides uid
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ═══════════════════════════════════════════════════════════════════════════

export const KEYBOARD_SHORTCUTS = {
  save: "Enter",
  cancel: "Escape",
  newTask: "n",
  search: "/",
  help: "?",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// COLUMN HEADERS
// ═══════════════════════════════════════════════════════════════════════════

export const COLUMN_HEADERS: ReadonlyArray<{
  key: string;
  label: string;
  icon?: string;
  width?: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
}> = [
  { key: "drag", label: "", icon: "GripVertical", width: "w-10", sortable: false },
  { key: "task", label: "Task", align: "left", sortable: true },
  { key: "assignee", label: "Assignee", width: "w-[140px]", align: "left", sortable: true },
  { key: "dueDate", label: "Due Date", width: "w-[120px]", align: "left", sortable: true },
  { key: "priority", label: "Priority", width: "w-[100px]", align: "left", sortable: true },
  { key: "status", label: "Status", width: "w-[110px]", align: "left", sortable: true },
  { key: "comments", label: "", icon: "MessageSquare", width: "w-[80px]", align: "center", sortable: false },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// DATE FORMAT OPTIONS
// ═══════════════════════════════════════════════════════════════════════════

export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric'
} as const;

export const DATE_FORMAT_FULL: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric'
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// EFFECTS & SHADOWS
// ═══════════════════════════════════════════════════════════════════════════

export const EFFECTS = {
  shadow: {
    none: "shadow-none",
    xs: "shadow-xs",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
    "2xl": "shadow-2xl",
    card: "shadow-card",
    cardHover: "shadow-card-hover",
    float: "shadow-float",
    glass: "shadow-glass",
  },
  hover: {
    shadow: "hover:shadow-lg",
    shadowXl: "hover:shadow-xl",
    scale: "hover:scale-[1.02]",
    scaleSmall: "hover:scale-[1.01]",
    brightness: "hover:brightness-105",
    lift: "hover:-translate-y-0.5",
    liftMore: "hover:-translate-y-1",
  },
  ring: {
    primary: "ring-2 ring-primary/30 ring-offset-2",
    success: "ring-2 ring-success/30 ring-offset-2",
    warning: "ring-2 ring-warning/30 ring-offset-2",
    error: "ring-2 ring-destructive/30 ring-offset-2",
    focus: "focus:ring-2 focus:ring-primary/30 focus:ring-offset-2",
  },
  backdrop: {
    blur: "backdrop-blur-xl",
    blurSm: "backdrop-blur-sm",
    blurMd: "backdrop-blur-md",
    saturate: "backdrop-saturate-150",
  },
  border: {
    subtle: "border border-border/50",
    default: "border border-border",
    strong: "border-2 border-border",
    dashed: "border-2 border-dashed border-border",
    gradient: "border-gradient",
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// CARD STYLES
// ═══════════════════════════════════════════════════════════════════════════

export const CARD_STYLES = {
  base: "rounded-xl border bg-card text-card-foreground transition-all duration-200",
  interactive: "cursor-pointer hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5",
  selected: "ring-2 ring-primary ring-offset-2 border-primary",
  dragging: "opacity-50 scale-[0.98] rotate-1",
  dragOver: "ring-2 ring-primary/50 ring-offset-2 border-primary/50 bg-primary/5",
  glass: "glass-card",
  elevated: "shadow-lg hover:shadow-xl",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// BUTTON STYLES
// ═══════════════════════════════════════════════════════════════════════════

export const BUTTON_STYLES = {
  icon: "h-9 w-9 p-0 rounded-lg",
  iconSm: "h-8 w-8 p-0 rounded-md",
  iconLg: "h-10 w-10 p-0 rounded-xl",
  addTask: "h-9 px-4 gap-2 text-sm font-medium",
  action: "h-10 px-4 gap-2",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// INPUT STYLES
// ═══════════════════════════════════════════════════════════════════════════

export const INPUT_STYLES = {
  base: "h-10 px-3 rounded-lg border border-input bg-background",
  focus: "focus:ring-2 focus:ring-primary/20 focus:border-primary",
  error: "border-destructive focus:ring-destructive/20",
  ghost: "border-transparent bg-transparent hover:bg-muted/50",
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// TASK ROW STYLES
// ═══════════════════════════════════════════════════════════════════════════

export const TASK_ROW_STYLES = {
  base: [
    "group relative",
    "rounded-lg md:rounded-xl border border-border/50 bg-card",
    "transition-all duration-200 ease-out",
    "hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30",
    "md:hover:scale-[1.01]",
    "active:scale-[0.99] md:active:scale-[1.01]",
  ].join(" "),
  content: "grid items-center px-4 py-3.5",
  dragHandle: [
    "cursor-grab active:cursor-grabbing",
    "p-1 rounded-md",
    "text-muted-foreground/40 hover:text-muted-foreground active:text-muted-foreground",
    "hover:bg-muted/50 active:bg-muted",
    "transition-colors duration-150",
    "touch-manipulation",
  ].join(" "),
  checkbox: [
    "h-5 w-5 rounded-md border-2",
    "transition-all duration-150",
    "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
  ].join(" "),
  title: [
    "font-medium text-foreground",
    "group-hover:text-primary",
    "transition-colors duration-150",
    "line-clamp-2 text-sm leading-relaxed",
  ].join(" "),
  meta: "text-xs text-muted-foreground",
  actionButton: [
    "h-9 px-3 gap-2",
    "text-xs font-medium",
    "border border-dashed border-muted-foreground/30",
    "hover:border-primary hover:bg-primary/5",
    "active:bg-primary/10",
    "transition-all duration-150",
    "touch-manipulation min-h-[44px]",
  ].join(" "),
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// STATUS SECTION STYLES
// ═══════════════════════════════════════════════════════════════════════════

export const STATUS_SECTION_STYLES = {
  container: [
    "rounded-2xl border bg-card overflow-hidden",
    "transition-all duration-300",
  ].join(" "),
  header: [
    "px-5 py-4",
    "border-b",
    "flex items-center justify-between",
  ].join(" "),
  headerLeft: "flex items-center gap-3",
  headerRight: "flex items-center gap-2",
  content: "p-4 space-y-2",
  emptyState: [
    "flex flex-col items-center justify-center",
    "py-12 px-6",
    "border-2 border-dashed border-muted-foreground/20 rounded-xl",
    "cursor-pointer group",
    "hover:border-primary/40 hover:bg-primary/5",
    "transition-all duration-200",
  ].join(" "),
} as const;
