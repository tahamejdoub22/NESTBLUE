// Message and conversation types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  type: "image" | "file" | "link";
  size?: number;
}

export interface Conversation {
  id: string;
  name: string;
  type: "direct" | "group";
  participants: ConversationParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  avatar?: string;
  isPinned?: boolean;
  isArchived?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationParticipant {
  id: string;
  name: string;
  avatar?: string;
  status: "online" | "offline" | "away" | "busy";
  role?: "admin" | "member";
}

