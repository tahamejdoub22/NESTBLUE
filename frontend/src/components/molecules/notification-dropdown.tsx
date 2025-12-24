"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/atoms/button";
import { Badge } from "@/components/atoms/badge";
import { NotificationItem } from "@/components/atoms/notification-item";
import { Notification } from "@/interfaces";
import { Bell, CheckCheck } from "lucide-react";

export interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount?: number;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  onNotificationClick?: (notification: Notification) => void;
  className?: string;
}

export function NotificationDropdown({
  notifications,
  unreadCount: propUnreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick,
  className,
}: NotificationDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyles, setMenuStyles] = useState<React.CSSProperties>({});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Use prop unreadCount if provided, otherwise calculate from notifications
  const unreadCount = propUnreadCount !== undefined 
    ? propUnreadCount 
    : notifications.filter((n) => !n.read).length;

  // Calculate menu position
  const updateMenuPosition = useCallback(() => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 380;
    const menuHeight = 500;

    // Position to the right of the trigger
    let left = rect.right - menuWidth;
    let top = rect.bottom + 8;

    // Adjust if menu would go off screen
    if (left < 8) left = 8;
    if (left + menuWidth > window.innerWidth - 8) {
      left = window.innerWidth - menuWidth - 8;
    }

    // Adjust if menu would go off bottom of screen
    if (top + menuHeight > window.innerHeight - 8) {
      top = rect.top - menuHeight - 8;
    }

    setMenuStyles({
      position: "fixed",
      left: `${left}px`,
      top: `${top}px`,
      width: `${menuWidth}px`,
      maxHeight: `${Math.min(menuHeight, window.innerHeight - top - 16)}px`,
      zIndex: 99999,
    });
  }, []);

  // Update position when opening
  useEffect(() => {
    if (isOpen) {
      updateMenuPosition();
      window.addEventListener("scroll", updateMenuPosition, true);
      window.addEventListener("resize", updateMenuPosition);
      return () => {
        window.removeEventListener("scroll", updateMenuPosition, true);
        window.removeEventListener("resize", updateMenuPosition);
      };
    }
  }, [isOpen, updateMenuPosition]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleNotificationClick = (notification: Notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    } else if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
    setIsOpen(false);
  };

  const handleMarkAsRead = (id: string) => {
    if (onMarkAsRead) {
      onMarkAsRead(id);
    }
  };

  const handleMarkAllAsRead = () => {
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    }
    setIsOpen(false);
  };

  const unreadNotifications = notifications.filter((n) => !n.read);
  const readNotifications = notifications.filter((n) => n.read);

  return (
    <div className={cn("relative inline-block", className)} ref={dropdownRef}>
      {/* Trigger Button */}
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -right-1 -top-1 h-5 w-5 p-0 flex items-center justify-center text-xs font-semibold"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown Menu */}
      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            style={menuStyles}
            className={cn(
              "flex flex-col rounded-xl border bg-card shadow-lg",
              "backdrop-blur-sm bg-background/95",
              "z-[99999] animate-fade-in-up"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-base font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {unreadCount} unread
                  </p>
                )}
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="h-8 text-xs"
                >
                  <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                  Mark all read
                </Button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1 max-h-[400px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-sm font-medium text-foreground mb-1">
                    No notifications
                  </p>
                  <p className="text-xs text-muted-foreground">
                    You're all caught up!
                  </p>
                </div>
              ) : (
                <>
                  {/* Unread Notifications */}
                  {unreadNotifications.length > 0 && (
                    <div>
                      {unreadNotifications.map((notification, index) => (
                        <div
                          key={notification.id}
                          className="animate-fade-in"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <NotificationItem
                            notification={notification}
                            onClick={() => handleNotificationClick(notification)}
                            onMarkAsRead={handleMarkAsRead}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Read Notifications */}
                  {readNotifications.length > 0 && (
                    <div>
                      {unreadNotifications.length > 0 && (
                        <div className="px-4 py-2 border-t bg-muted/30">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Earlier
                          </p>
                        </div>
                      )}
                      {readNotifications.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onClick={() => handleNotificationClick(notification)}
                          onMarkAsRead={handleMarkAsRead}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    router.push("/notifications");
                    setIsOpen(false);
                  }}
                  className="text-xs"
                >
                  View all notifications
                </Button>
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}

