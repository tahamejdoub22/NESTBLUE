"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms/button";
import { Avatar } from "@/components/atoms/avatar";
import {
  Menu,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Bell,
} from "lucide-react";
import { Dropdown, DropdownItem } from "@/components/molecules/dropdown";
import { NotificationDropdown } from "@/components/molecules/notification-dropdown";
import { Notification } from "@/interfaces";
import { useNotifications, useUnreadNotificationCount } from "@/hooks/use-notifications";
import { useCurrentAuthUser, useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface NavbarProps {
  onMenuClick?: () => void;
  sidebarCollapsed?: boolean;
}

export function Navbar({ onMenuClick, sidebarCollapsed = false }: NavbarProps) {
  const router = useRouter();
  const { user } = useCurrentAuthUser();
  const { logout, isLoggingOut } = useAuth();
  const { notifications, markRead, markAllRead } = useNotifications();
  const { count: unreadCount } = useUnreadNotificationCount();

  const userMenuItems: DropdownItem[] = [
    {
      value: "notifications",
      label: "Show Notifications",
      icon: <Bell className="h-4 w-4" />,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      value: "profile",
      label: "Profile",
      icon: <User className="h-4 w-4" />,
    },
    {
      value: "settings",
      label: "Settings",
      icon: <Settings className="h-4 w-4" />,
    },
    {
      value: "logout",
      label: isLoggingOut ? "Logging out..." : "Logout",
      icon: <LogOut className="h-4 w-4" />,
      disabled: isLoggingOut,
    },
  ];

  const handleUserMenuSelect = async (value: string) => {
    if (value === "notifications") {
      router.push("/notifications");
    } else if (value === "profile") {
      router.push("/profile");
    } else if (value === "settings") {
      router.push("/settings");
    } else if (value === "logout") {
      try {
        // Call backend logout API and clear tokens
        await logout();
        toast.success("Logged out successfully");
      } catch (error: any) {
        console.error("Logout error:", error);
        // Even if backend logout fails, tokens are cleared by the hook
        toast.error(error?.response?.data?.message || "Failed to logout");
      }
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markRead(id);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllRead();
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast.error("Failed to mark all notifications as read");
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      await handleMarkAsRead(notification.id);
    }
    // Navigate to action URL if available
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  return (
    <nav className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 px-4 sm:px-6">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden h-9 w-9 rounded-xl hover:bg-primary/5"
        >
          <Menu className="h-5 w-5 text-foreground/70" />
        </Button>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/30 border border-border/40">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse-soft" />
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Live Performance</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onNotificationClick={handleNotificationClick}
        />

        {/* Separator */}
        <div className="w-px h-6 bg-border/40 mx-1 hidden sm:block" />

        {/* User Menu */}
        <Dropdown
          items={userMenuItems}
          onSelect={handleUserMenuSelect}
          trigger={
            <Button 
              variant="ghost" 
              className="flex items-center gap-2.5 h-11 py-1 px-1.5 rounded-xl hover:bg-primary/5 transition-all duration-300 active:scale-95 group"
              type="button"
            >
              <Avatar fallback={user?.name || "User"} size="sm" src={user?.avatar} status="online" className="shadow-sm border border-border/20" />
              <div className="hidden md:flex flex-col items-start gap-0">
                <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{user?.name || "User"}</span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tighter">{user?.role || "Member"}</span>
              </div>
              <ChevronDown className="h-4 w-4 hidden md:block text-muted-foreground transition-transform group-hover:translate-y-0.5" />
            </Button>
          }
          align="right"
        />
      </div>
    </nav>
  );
}
