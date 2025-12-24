"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messageApi, conversationApi } from "@/core/services/api-helpers";
import type { Message, Conversation } from "@/interfaces";

const CONVERSATIONS_QUERY_KEY = ["conversations"];
const MESSAGES_QUERY_KEY = (conversationId: string) => ["messages", conversationId];

export function useConversations() {
  const queryClient = useQueryClient();

  const conversationsQuery = useQuery({
    queryKey: CONVERSATIONS_QUERY_KEY,
    queryFn: async () => {
      const data = await conversationApi.getAll();
      // Normalize dates: convert string dates to Date objects
      return data.map((conv: Conversation) => ({
        ...conv,
        createdAt: conv.createdAt instanceof Date ? conv.createdAt : new Date(conv.createdAt),
        updatedAt: conv.updatedAt instanceof Date ? conv.updatedAt : new Date(conv.updatedAt),
        lastMessage: conv.lastMessage ? {
          ...conv.lastMessage,
          createdAt: conv.lastMessage.createdAt instanceof Date 
            ? conv.lastMessage.createdAt 
            : new Date(conv.lastMessage.createdAt),
          updatedAt: conv.lastMessage.updatedAt instanceof Date 
            ? conv.lastMessage.updatedAt 
            : new Date(conv.lastMessage.updatedAt),
        } : undefined,
      }));
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const createMutation = useMutation({
    mutationFn: (input: Omit<Conversation, "id" | "createdAt" | "updatedAt">) => conversationApi.create(input),
    onSuccess: (data) => {
      // Normalize dates for the new conversation
      const normalized = {
        ...data,
        createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt),
        updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(data.updatedAt),
      };
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
      return normalized;
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Conversation, "id" | "createdAt" | "updatedAt">> }) =>
      conversationApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => conversationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => conversationApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
    },
  });

  return {
    conversations: conversationsQuery.data || [],
    isLoading: conversationsQuery.isLoading,
    error: conversationsQuery.error,
    createConversation: createMutation.mutateAsync,
    updateConversation: updateMutation.mutateAsync,
    deleteConversation: deleteMutation.mutateAsync,
    markConversationRead: markReadMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useMessages(conversationId: string) {
  const queryClient = useQueryClient();

  const messagesQuery = useQuery({
    queryKey: MESSAGES_QUERY_KEY(conversationId),
    queryFn: async () => {
      const data = await messageApi.getByConversation(conversationId);
      // Normalize dates: convert string dates to Date objects
      // Also handle attachments: backend returns string[], frontend expects MessageAttachment[] or undefined
      return data.map((msg: Message) => ({
        ...msg,
        createdAt: msg.createdAt instanceof Date ? msg.createdAt : new Date(msg.createdAt),
        updatedAt: msg.updatedAt instanceof Date ? msg.updatedAt : new Date(msg.updatedAt),
        // Backend returns attachments as string[], but frontend interface expects MessageAttachment[] or undefined
        // If attachments is an array of strings, keep it as is (or transform if needed)
        attachments: Array.isArray(msg.attachments) && msg.attachments.length > 0 
          ? (typeof msg.attachments[0] === 'string' ? undefined : msg.attachments)
          : undefined,
      }));
    },
    enabled: !!conversationId,
    staleTime: 1000 * 60 * 2, // 2 minutes (messages update more frequently)
  });

  const createMutation = useMutation({
    mutationFn: (input: { content: string; attachments?: string[] }) => {
      // Backend DTO expects only content and optional attachments
      return messageApi.create(conversationId, {
        content: input.content,
        attachments: input.attachments,
      });
    },
    onSuccess: (data) => {
      // Normalize dates for the new message
      const normalized = {
        ...data,
        createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt),
        updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(data.updatedAt),
      };
      queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEY(conversationId) });
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
      return normalized;
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Message, "id" | "createdAt" | "updatedAt">> }) =>
      messageApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEY(conversationId) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => messageApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEY(conversationId) });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => messageApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEY(conversationId) });
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
    },
  });

  return {
    messages: messagesQuery.data || [],
    isLoading: messagesQuery.isLoading,
    error: messagesQuery.error,
    createMessage: createMutation.mutateAsync,
    updateMessage: updateMutation.mutateAsync,
    deleteMessage: deleteMutation.mutateAsync,
    markMessageRead: markReadMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

