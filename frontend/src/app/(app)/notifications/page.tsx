"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { renderNotificationsPage } from "@/template/page/notifications.template";
import { Notification, NotificationType } from "@/interfaces";
import { useNotifications } from "@/hooks/use-notifications";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/atoms/loading-screen";

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, isLoading, markRead, markAllRead, deleteNotification } = useNotifications();
  const [selectedType, setSelectedType] = useState<NotificationType | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<"all" | "unread" | "read">("all");
  const [showFilters, setShowFilters] = useState(false);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter((n) => n.type === selectedType);
    }

    // Filter by status
    if (selectedStatus === "unread") {
      filtered = filtered.filter((n) => !n.read);
    } else if (selectedStatus === "read") {
      filtered = filtered.filter((n) => n.read);
    }

    // Sort by date (newest first)
    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [notifications, selectedType, selectedStatus]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const unreadFiltered = filteredNotifications.filter((n) => !n.read);
  const readFiltered = filteredNotifications.filter((n) => n.read);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markRead(id);
      toast.success("Notification marked as read");
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllRead();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all notifications as read");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const handleDeleteAll = () => {
    if (confirm("Are you sure you want to delete all notifications?")) {
      // Delete all notifications one by one
      Promise.all(notifications.map(n => deleteNotification(n.id)))
        .then(() => toast.success("All notifications deleted"))
        .catch(() => toast.error("Failed to delete some notifications"));
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const clearFilters = () => {
    setSelectedType("all");
    setSelectedStatus("all");
  };

  const hasActiveFilters = selectedType !== "all" || selectedStatus !== "all";

  if (isLoading) {
    return <LoadingScreen type="notifications" />;
  }

  return renderNotificationsPage({
    notifications,
    filteredNotifications,
    selectedType,
    selectedStatus,
    showFilters,
    unreadCount,
    hasActiveFilters,
    onTypeChange: setSelectedType,
    onStatusChange: setSelectedStatus,
    onToggleFilters: () => setShowFilters(!showFilters),
    onClearFilters: clearFilters,
    onMarkAsRead: handleMarkAsRead,
    onMarkAllAsRead: handleMarkAllAsRead,
    onDelete: handleDelete,
    onDeleteAll: handleDeleteAll,
    onNotificationClick: handleNotificationClick,
  });
}
