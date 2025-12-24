"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { notificationApi } from "@/core/services/api-helpers";
import { websocketService } from "@/core/services/websocket";
import type { Notification } from "@/interfaces";

const NOTIFICATIONS_QUERY_KEY = ["notifications"];
const UNREAD_COUNT_QUERY_KEY = ["notifications", "unread-count"];

export function useNotifications() {
  const queryClient = useQueryClient();
  const isConnectedRef = useRef(false);

  // Connect to WebSocket when component mounts and user is authenticated
  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("auth_token");
    if (!token) return;

    // Connect to WebSocket
    if (!isConnectedRef.current) {
      websocketService.connect(token);
      isConnectedRef.current = true;
    }

    // Listen for new notifications
    const unsubscribeNotification = websocketService.on("notification", (notification: Notification) => {
      // Add new notification to the list
      queryClient.setQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY, (old = []) => {
        // Check if notification already exists
        if (old.some((n) => n.id === notification.id)) {
          return old;
        }
        // Normalize dates
        const normalizedNotification = {
          ...notification,
          createdAt: notification.createdAt instanceof Date 
            ? notification.createdAt 
            : new Date(notification.createdAt),
          updatedAt: notification.updatedAt instanceof Date 
            ? notification.updatedAt 
            : new Date(notification.updatedAt),
        };
        return [normalizedNotification, ...old];
      });
    });

    // Listen for unread count updates
    const unsubscribeCount = websocketService.on("unread-count", (data: { count: number }) => {
      queryClient.setQueryData<number>(UNREAD_COUNT_QUERY_KEY, data.count);
    });

    // Cleanup on unmount
    return () => {
      unsubscribeNotification();
      unsubscribeCount();
    };
  }, [queryClient]);

  const notificationsQuery = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: async () => {
      const data = await notificationApi.getAll();
      // Normalize dates: convert string dates to Date objects
      return data.map((notification: Notification) => ({
        ...notification,
        createdAt: notification.createdAt instanceof Date 
          ? notification.createdAt 
          : new Date(notification.createdAt),
        updatedAt: notification.updatedAt instanceof Date 
          ? notification.updatedAt 
          : new Date(notification.updatedAt),
      }));
    },
    staleTime: 1000 * 60 * 2, // 2 minutes (notifications update frequently)
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
  });

  return {
    notifications: notificationsQuery.data || [],
    isLoading: notificationsQuery.isLoading,
    error: notificationsQuery.error,
    markRead: markReadMutation.mutateAsync,
    markAllRead: markAllReadMutation.mutateAsync,
    deleteNotification: deleteMutation.mutateAsync,
    isMarkingRead: markReadMutation.isPending,
    isMarkingAllRead: markAllReadMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useUnreadNotificationCount() {
  const queryClient = useQueryClient();
  const isConnectedRef = useRef(false);

  // Connect to WebSocket for real-time count updates
  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("auth_token");
    if (!token) return;

    // Connect to WebSocket if not already connected
    if (!isConnectedRef.current) {
      websocketService.connect(token);
      isConnectedRef.current = true;
    }

    // Listen for unread count updates
    const unsubscribeCount = websocketService.on("unread-count", (data: { count: number }) => {
      queryClient.setQueryData<number>(UNREAD_COUNT_QUERY_KEY, data.count);
    });

    return () => {
      unsubscribeCount();
    };
  }, [queryClient]);

  const countQuery = useQuery({
    queryKey: UNREAD_COUNT_QUERY_KEY,
    queryFn: () => notificationApi.getUnreadCount(),
    staleTime: 1000 * 60 * 1, // 1 minute (count updates frequently)
    refetchInterval: false, // Don't refetch automatically - rely on WebSocket
  });

  return {
    count: countQuery.data ?? 0,
    isLoading: countQuery.isLoading,
    error: countQuery.error,
    refetch: () => queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY }),
  };
}



