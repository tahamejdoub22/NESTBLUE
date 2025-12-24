"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { renderMessagesPage } from "@/template/page/messages.template";
import { Conversation, Message } from "@/interfaces/message.interface";
import { useConversations, useMessages } from "@/hooks/use-messages";
import { useCurrentAuthUser } from "@/hooks/use-auth";
import { NewConversationModal } from "@/components/molecules/new-conversation-modal";
import { toast } from "sonner";
import { formatRelativeDate } from "@/shared/utils/format";
import { LoadingScreen } from "@/components/atoms/loading-screen";

export default function MessagesPage() {
  const { user } = useCurrentAuthUser();
  const { conversations, createConversation, isLoading: conversationsLoading, isCreating } = useConversations();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    conversations[0]?.id || null
  );
  const { messages, createMessage, isLoading: messagesLoading } = useMessages(selectedConversationId || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showConversationList, setShowConversationList] = useState(false);
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);

  // Filter conversations by search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter(
      (conv) =>
        conv.name.toLowerCase().includes(query) ||
        conv.lastMessage?.content.toLowerCase().includes(query)
    );
  }, [conversations, searchQuery]);

  // Get selected conversation
  const selectedConversation = useMemo(() => {
    return conversations.find((c) => c.id === selectedConversationId);
  }, [conversations, selectedConversationId]);

  // Get messages for selected conversation
  const currentMessages = useMemo(() => {
    if (!selectedConversationId) return [];
    return messages || [];
  }, [selectedConversationId, messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentMessages]);

  // Update selected conversation when conversations load
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  // Close conversation list on mobile when window is resized to tablet/desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowConversationList(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversationId) return;
    if (!user?.id) {
      toast.error("You must be logged in to send messages");
      return;
    }

    try {
      // Backend expects only content and optional attachments
      // senderId and senderName are automatically set by the backend from the authenticated user
      await createMessage({
        content: messageInput.trim(),
        attachments: undefined, // Optional attachments array
      });
      setMessageInput("");
      toast.success("Message sent");
    } catch (error: any) {
      console.error("Failed to send message:", error);
      toast.error(error?.response?.data?.message || "Failed to send message");
    }
  };

  const formatMessageTime = (date: Date) => {
    return formatRelativeDate(date);
  };

  const unreadCount = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);

  if (conversationsLoading) {
    return <LoadingScreen type="messages" />;
  }

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    // Close conversation list on mobile after selection
    setShowConversationList(false);
  };

  const handleCreateConversation = async (data: {
    name: string;
    type: "direct" | "group";
    participantIds: string[];
    projectUid?: string;
    spaceId?: string;
  }) => {
    await createConversation({
      name: data.name,
      type: data.type,
      participantIds: data.participantIds,
      projectUid: data.projectUid,
      spaceId: data.spaceId,
    } as any);
  };

  return (
    <>
      {renderMessagesPage({
        conversations,
        selectedConversationId,
        currentUserId: user?.id ?? null,
        searchQuery,
        messageInput,
        currentMessages,
        unreadCount,
        filteredConversations,
        selectedConversation,
        showConversationList,
        onSearchChange: setSearchQuery,
        onMessageInputChange: setMessageInput,
        onSendMessage: handleSendMessage,
        onSelectConversation: handleSelectConversation,
        onToggleConversationList: () => setShowConversationList(!showConversationList),
        onNewConversation: () => {
          setIsNewConversationModalOpen(true);
        },
        formatMessageTime,
        messagesEndRef,
      })}
      <NewConversationModal
        open={isNewConversationModalOpen}
        onOpenChange={setIsNewConversationModalOpen}
        onCreate={handleCreateConversation}
        isLoading={isCreating}
      />
    </>
  );
}

