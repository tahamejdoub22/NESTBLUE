"use client";

import { cn } from "@/lib/utils";
import { Notification, NotificationType } from "@/interfaces";
import { 
  CheckCircle2, 
  Info, 
  AlertTriangle, 
  XCircle,
  FileText,
  FolderOpen,
  DollarSign,
  Receipt,
  Clock,
  Trash2,
  Check
} from "lucide-react";
import { Button } from "./button";
import { formatDistanceToNow } from "date-fns";

export interface NotificationItemProps {
  notification: Notification;
  onClick?: () => void;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

const typeIcons: Record<NotificationType, React.ReactNode> = {
  info: <Info className="h-4 w-4" />,
  success: <CheckCircle2 className="h-4 w-4" />,
  warning: <AlertTriangle className="h-4 w-4" />,
  error: <XCircle className="h-4 w-4" />,
  task: <FileText className="h-4 w-4" />,
  project: <FolderOpen className="h-4 w-4" />,
  budget: <DollarSign className="h-4 w-4" />,
  cost: <Receipt className="h-4 w-4" />,
  expense: <DollarSign className="h-4 w-4" />,
};

const typeColors: Record<NotificationType, string> = {
  info: "text-info-600 bg-info-50 border-info-200 dark:text-info-400 dark:bg-info-950/30 dark:border-info-800",
  success: "text-success-600 bg-success-50 border-success-200 dark:text-success-400 dark:bg-success-950/30 dark:border-success-800",
  warning: "text-warning-600 bg-warning-50 border-warning-200 dark:text-warning-400 dark:bg-warning-950/30 dark:border-warning-800",
  error: "text-destructive-600 bg-destructive-50 border-destructive-200 dark:text-destructive-400 dark:bg-destructive-950/30 dark:border-destructive-800",
  task: "text-primary-600 bg-primary-50 border-primary-200 dark:text-primary-400 dark:bg-primary-950/30 dark:border-primary-800",
  project: "text-primary-600 bg-primary-50 border-primary-200 dark:text-primary-400 dark:bg-primary-950/30 dark:border-primary-800",
  budget: "text-primary-600 bg-primary-50 border-primary-200 dark:text-primary-400 dark:bg-primary-950/30 dark:border-primary-800",
  cost: "text-primary-600 bg-primary-50 border-primary-200 dark:text-primary-400 dark:bg-primary-950/30 dark:border-primary-800",
  expense: "text-primary-600 bg-primary-50 border-primary-200 dark:text-primary-400 dark:bg-primary-950/30 dark:border-primary-800",
};

export function NotificationItem({ 
  notification, 
  onClick, 
  onMarkAsRead,
  onDelete,
  className 
}: NotificationItemProps) {
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });
  const icon = typeIcons[notification.type] || <Info className="h-4 w-4" />;
  const colorClass = typeColors[notification.type] || typeColors.info;

  const handleClick = () => {
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    if (onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(notification.id);
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative flex gap-3 p-4 cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
        "hover:bg-accent/50",
        !notification.read && "bg-primary/5 hover:bg-primary/10",
        className
      )}
    >
      {/* Icon */}
      <div className={cn(
        "flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center border transition-all group-hover:scale-105 group-focus-within:scale-105",
        colorClass
      )}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={cn(
                "text-sm font-semibold",
                !notification.read && "text-foreground",
                notification.read && "text-muted-foreground"
              )}>
                {notification.title}
              </h4>
              {!notification.read && (
                <div className="flex-shrink-0 h-2 w-2 rounded-full bg-primary animate-pulse" />
              )}
            </div>
            <p className={cn(
              "text-sm leading-relaxed",
              !notification.read ? "text-foreground" : "text-muted-foreground"
            )}>
              {notification.message}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{timeAgo}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {notification.actionLabel && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded hover:bg-primary/10"
              >
                {notification.actionLabel} →
              </button>
            )}
            
            {/* Action Buttons */}
            <div className={cn(
              "flex items-center gap-1 transition-opacity opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
            )}>
              {!notification.read && onMarkAsRead && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleMarkAsRead}
                  title="Mark as read"
                  aria-label="Mark as read"
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleDelete}
                  title="Delete"
                  aria-label="Delete notification"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

