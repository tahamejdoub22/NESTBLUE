"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Avatar } from "@/components/atoms/avatar";
import { Badge } from "@/components/atoms/badge";
import { Conversation, Message } from "@/interfaces/message.interface";
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  MessageSquare,
  Users,
  ArrowLeft,
  X,
  Smile,
  Plus,
  Pin,
  Check,
  CheckCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RefObject } from "react";
import { format } from "date-fns";

export interface MessagesPageTemplateProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  currentUserId: string | null;
  searchQuery: string;
  messageInput: string;
  currentMessages: Message[];
  unreadCount: number;
  filteredConversations: Conversation[];
  selectedConversation: Conversation | undefined;
  showConversationList?: boolean;
  onSearchChange: (value: string) => void;
  onMessageInputChange: (value: string) => void;
  onSendMessage: () => void;
  onSelectConversation: (id: string) => void;
  onToggleConversationList?: () => void;
  onNewConversation: () => void;
  formatMessageTime: (date: Date) => string;
  messagesEndRef?: RefObject<HTMLDivElement>;
}

export function renderMessagesPage(props: MessagesPageTemplateProps) {
  const {
    conversations,
    selectedConversationId,
    currentUserId,
    searchQuery,
    messageInput,
    currentMessages,
    unreadCount,
    filteredConversations,
    selectedConversation,
    showConversationList = false,
    onSearchChange,
    onMessageInputChange,
    onSendMessage,
    onSelectConversation,
    onToggleConversationList,
    onNewConversation,
    formatMessageTime,
    messagesEndRef,
  } = props;

  const isOwnMessage = (message: Message) => {
    return !!currentUserId && message.senderId === currentUserId;
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-[#F7F9FC] dark:bg-background flex flex-col">
      <div className="flex-1 flex overflow-hidden max-w-[1920px] mx-auto w-full">
        {/* Conversations Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "absolute inset-y-0 left-0 z-50 w-full flex flex-col bg-card border-r border-border/40 transition-transform duration-300 ease-in-out shadow-lg",
            showConversationList ? "translate-x-0" : "-translate-x-full",
            "md:relative md:z-auto md:translate-x-0 md:w-80 md:shadow-none",
            "lg:w-96"
          )}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border/40 bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Messages</h2>
                {unreadCount > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {unreadCount} unread
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 md:hidden"
                  onClick={onToggleConversationList}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onNewConversation}
                  className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-all"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Search */}
            <Input
              placeholder="Search conversations..."
              leftIcon={<Search className="h-4 w-4 text-muted-foreground" />}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-background border-border/40"
            />
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {filteredConversations.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full p-8 text-center"
              >
                <div className="rounded-full bg-muted/50 p-4 mb-4">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  {searchQuery ? "No conversations found" : "No conversations yet"}
                </p>
                <p className="text-xs text-muted-foreground max-w-xs mb-4">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Start a new conversation to get started"}
                </p>
                {!searchQuery && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onNewConversation}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    New Conversation
                  </Button>
                )}
              </motion.div>
            ) : (
              <div className="divide-y divide-border/40">
                <AnimatePresence>
                  {filteredConversations.map((conversation, index) => {
                    const isSelected = conversation.id === selectedConversationId;
                    const isUnread = conversation.unreadCount > 0;
                    const otherParticipant =
                      conversation.type === "direct"
                        ? conversation.participants.find((p) => p.id !== currentUserId)
                        : null;

                    return (
                      <motion.button
                        key={conversation.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => onSelectConversation(conversation.id)}
                        className={cn(
                          "w-full p-3 text-left transition-all duration-200 relative",
                          "hover:bg-accent/50 active:bg-accent",
                          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2",
                          isSelected && "bg-primary/10 border-l-4 border-l-primary"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative flex-shrink-0">
                            <Avatar
                              fallback={
                                conversation.type === "direct"
                                  ? otherParticipant?.name || conversation.name
                                  : conversation.name
                              }
                              size="md"
                              status={
                                conversation.type === "direct"
                                  ? otherParticipant?.status || "offline"
                                  : undefined
                              }
                              src={
                                conversation.type === "direct"
                                  ? otherParticipant?.avatar
                                  : conversation.avatar
                              }
                              className={cn(
                                "transition-all duration-200",
                                isSelected && "ring-2 ring-primary/30 ring-offset-2"
                              )}
                            />
                            {conversation.type === "group" && (
                              <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-primary border-2 border-card flex items-center justify-center shadow-sm">
                                <Users className="h-3 w-3 text-primary-foreground" />
                              </div>
                            )}
                            {conversation.isPinned && (
                              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                                <Pin className="h-2.5 w-2.5 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1 gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <p
                                  className={cn(
                                    "text-sm font-semibold truncate",
                                    isSelected ? "text-primary" : "text-foreground",
                                    isUnread && !isSelected && "font-bold"
                                  )}
                                >
                                  {conversation.type === "direct"
                                    ? otherParticipant?.name || conversation.name
                                    : conversation.name}
                                </p>
                                {conversation.isPinned && (
                                  <Pin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                )}
                              </div>
                              {conversation.lastMessage && (
                                <span
                                  className={cn(
                                    "text-[10px] flex-shrink-0",
                                    isUnread
                                      ? "text-foreground font-semibold"
                                      : "text-muted-foreground"
                                  )}
                                >
                                  {format(new Date(conversation.lastMessage.createdAt), "HH:mm")}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <p
                                className={cn(
                                  "text-xs truncate",
                                  isUnread
                                    ? "text-foreground font-medium"
                                    : "text-muted-foreground"
                                )}
                              >
                                {conversation.lastMessage?.content || "No messages yet"}
                              </p>
                              {isUnread && (
                                <Badge
                                  variant="primary"
                                  className="h-5 min-w-5 px-1.5 text-[10px] font-bold flex-shrink-0"
                                >
                                  {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>

        {/* Mobile Overlay */}
        {showConversationList && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={onToggleConversationList}
          />
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0 md:hidden"
                    onClick={onToggleConversationList}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>

                  <div className="relative flex-shrink-0">
                    <Avatar
                      fallback={selectedConversation.name}
                      size="md"
                      status={
                        selectedConversation.type === "direct"
                          ? selectedConversation.participants.find((p) => p.id !== currentUserId)
                              ?.status || "offline"
                          : undefined
                      }
                      src={
                        selectedConversation.type === "direct"
                          ? selectedConversation.participants.find((p) => p.id !== currentUserId)
                              ?.avatar
                          : selectedConversation.avatar
                      }
                      className="ring-2 ring-primary/20"
                    />
                    {selectedConversation.type === "group" && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-primary border-2 border-card flex items-center justify-center shadow-sm">
                        <Users className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {selectedConversation.name}
                    </p>
                    {selectedConversation.type === "direct" && (
                      <p className="text-xs text-muted-foreground capitalize">
                        {
                          selectedConversation.participants.find((p) => p.id !== currentUserId)
                            ?.status || "offline"
                        }
                      </p>
                    )}
                    {selectedConversation.type === "group" && (
                      <p className="text-xs text-muted-foreground">
                        {selectedConversation.participants.length} participant
                        {selectedConversation.participants.length !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto overscroll-contain p-4 md:p-6 space-y-4 bg-gradient-to-b from-background via-background to-muted/10">
                {currentMessages.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center h-full text-center px-4"
                  >
                    <div className="rounded-full bg-primary/10 p-6 mb-4">
                      <MessageSquare className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No messages yet
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Start the conversation by sending your first message!
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <AnimatePresence>
                      {currentMessages.map((message, index) => {
                        const isOwn = isOwnMessage(message);
                        const prevMessage = index > 0 ? currentMessages[index - 1] : null;
                        const nextMessage =
                          index < currentMessages.length - 1
                            ? currentMessages[index + 1]
                            : null;
                        const showAvatar =
                          !isOwn &&
                          (prevMessage === null || prevMessage.senderId !== message.senderId);
                        const showTimeSeparator =
                          prevMessage === null ||
                          new Date(message.createdAt).getTime() -
                            new Date(prevMessage.createdAt).getTime() >
                            5 * 60 * 1000;
                        const isGrouped =
                          !isOwn &&
                          prevMessage !== null &&
                          prevMessage.senderId === message.senderId &&
                          new Date(message.createdAt).getTime() -
                            new Date(prevMessage.createdAt).getTime() <
                            5 * 60 * 1000;

                        return (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.02 }}
                          >
                            {showTimeSeparator && (
                              <div className="flex items-center justify-center my-6">
                                <div className="px-3 py-1 rounded-full bg-muted/50 text-xs text-muted-foreground border border-border/40">
                                  {format(new Date(message.createdAt), "MMM dd, yyyy 'at' HH:mm")}
                                </div>
                              </div>
                            )}
                            <div
                              className={cn(
                                "flex items-end gap-2 group",
                                isOwn && "flex-row-reverse",
                                !isGrouped && "mb-1"
                              )}
                            >
                              {showAvatar && !isOwn && (
                                <Avatar
                                  fallback={message.senderName}
                                  size="sm"
                                  src={message.senderAvatar}
                                  className="flex-shrink-0 mb-1"
                                />
                              )}
                              {!showAvatar && !isOwn && (
                                <div className="w-8 flex-shrink-0" />
                              )}
                              <div
                                className={cn(
                                  "max-w-[75%] sm:max-w-[65%] md:max-w-[60%] rounded-2xl px-4 py-2.5 shadow-sm transition-all duration-200",
                                  "group-hover:shadow-md",
                                  isOwn
                                    ? "bg-primary text-primary-foreground rounded-br-md"
                                    : "bg-card border border-border/40 text-foreground rounded-bl-md",
                                  isGrouped && !isOwn && "ml-10"
                                )}
                              >
                                {!isOwn && showAvatar && (
                                  <p className="text-xs font-semibold text-foreground mb-1.5">
                                    {message.senderName}
                                  </p>
                                )}
                                <p
                                  className={cn(
                                    "text-sm whitespace-pre-wrap break-words leading-relaxed",
                                    isOwn && "text-primary-foreground"
                                  )}
                                >
                                  {message.content}
                                </p>
                                <div
                                  className={cn(
                                    "flex items-center justify-end gap-1.5 mt-2",
                                    isOwn ? "flex-row-reverse" : "flex-row"
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "text-[10px]",
                                      isOwn
                                        ? "text-primary-foreground/70"
                                        : "text-muted-foreground"
                                    )}
                                  >
                                    {format(new Date(message.createdAt), "HH:mm")}
                                  </span>
                                  {isOwn && (
                                    <div className="flex items-center">
                                      {message.read ? (
                                        <CheckCheck className="h-3 w-3 text-primary-foreground/70" />
                                      ) : (
                                        <Check className="h-3 w-3 text-primary-foreground/70" />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border-t border-border/40 bg-card/50 backdrop-blur-sm"
              >
                <div className="flex items-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 flex-shrink-0 hover:bg-muted"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 relative">
                    <textarea
                      value={messageInput}
                      onChange={(e) => {
                        onMessageInputChange(e.target.value);
                        e.target.style.height = "auto";
                        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          onSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      rows={1}
                      className={cn(
                        "w-full min-h-[44px] max-h-[120px] px-4 py-3 pr-10",
                        "rounded-2xl border border-border/40 bg-background text-sm",
                        "resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2",
                        "placeholder:text-muted-foreground"
                      )}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 bottom-1 h-8 w-8 flex-shrink-0 hover:bg-muted"
                    >
                      <Smile className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    onClick={onSendMessage}
                    disabled={!messageInput.trim()}
                    className={cn(
                      "gap-2 flex-shrink-0 h-9 px-4",
                      "transition-all duration-200",
                      messageInput.trim()
                        ? "bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md"
                        : "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Send className="h-4 w-4" />
                    <span className="hidden sm:inline">Send</span>
                  </Button>
                </div>
              </motion.div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full text-center px-4"
            >
              <div className="rounded-full bg-primary/10 p-8 mb-6">
                <MessageSquare className="h-16 w-16 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Select a conversation
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                Choose a conversation from the list to start messaging, or create a new one to get
                started.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="gap-2"
                onClick={onNewConversation}
              >
                <Users className="h-4 w-4" />
                New Conversation
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
