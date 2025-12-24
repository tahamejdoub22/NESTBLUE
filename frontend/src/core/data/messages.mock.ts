import { Conversation, Message } from "@/interfaces/message.interface";
import { generateUniqueId } from "@/lib/utils";

const now = new Date();
const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

// Mock conversations
export const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    name: "Esther Howard",
    type: "direct",
    participants: [
      {
        id: "user-1",
        name: "Esther Howard",
        avatar: undefined,
        status: "online",
      },
      {
        id: "current-user",
        name: "John Doe",
        avatar: undefined,
        status: "online",
      },
    ],
    lastMessage: {
      id: "msg-1",
      conversationId: "conv-1",
      senderId: "user-1",
      senderName: "Esther Howard",
      content: "Hey! Can we discuss the budget for the new project?",
      read: false,
      createdAt: fiveMinutesAgo,
      updatedAt: fiveMinutesAgo,
    },
    unreadCount: 2,
    isPinned: true,
    createdAt: twoDaysAgo,
    updatedAt: fiveMinutesAgo,
  },
  {
    id: "conv-2",
    name: "Jacob Jones",
    type: "direct",
    participants: [
      {
        id: "user-2",
        name: "Jacob Jones",
        avatar: undefined,
        status: "busy",
      },
      {
        id: "current-user",
        name: "John Doe",
        avatar: undefined,
        status: "online",
      },
    ],
    lastMessage: {
      id: "msg-2",
      conversationId: "conv-2",
      senderId: "current-user",
      senderName: "John Doe",
      content: "Thanks for the update on the task progress!",
      read: true,
      createdAt: oneHourAgo,
      updatedAt: oneHourAgo,
    },
    unreadCount: 0,
    createdAt: yesterday,
    updatedAt: oneHourAgo,
  },
  {
    id: "conv-3",
    name: "Cody Fisher",
    type: "direct",
    participants: [
      {
        id: "user-3",
        name: "Cody Fisher",
        avatar: undefined,
        status: "away",
      },
      {
        id: "current-user",
        name: "John Doe",
        avatar: undefined,
        status: "online",
      },
    ],
    lastMessage: {
      id: "msg-3",
      conversationId: "conv-3",
      senderId: "user-3",
      senderName: "Cody Fisher",
      content: "I'll review the contract and get back to you.",
      read: true,
      createdAt: yesterday,
      updatedAt: yesterday,
    },
    unreadCount: 0,
    createdAt: twoDaysAgo,
    updatedAt: yesterday,
  },
  {
    id: "conv-4",
    name: "Project Team",
    type: "group",
    participants: [
      {
        id: "user-1",
        name: "Esther Howard",
        avatar: undefined,
        status: "online",
        role: "admin",
      },
      {
        id: "user-2",
        name: "Jacob Jones",
        avatar: undefined,
        status: "busy",
        role: "member",
      },
      {
        id: "user-3",
        name: "Cody Fisher",
        avatar: undefined,
        status: "away",
        role: "member",
      },
      {
        id: "current-user",
        name: "John Doe",
        avatar: undefined,
        status: "online",
        role: "admin",
      },
    ],
    lastMessage: {
      id: "msg-4",
      conversationId: "conv-4",
      senderId: "user-1",
      senderName: "Esther Howard",
      content: "The sprint review meeting is scheduled for tomorrow at 2 PM.",
      read: false,
      createdAt: oneHourAgo,
      updatedAt: oneHourAgo,
    },
    unreadCount: 1,
    isPinned: false,
    createdAt: twoDaysAgo,
    updatedAt: oneHourAgo,
  },
];

// Mock messages for conversations
export const mockMessages: Record<string, Message[]> = {
  "conv-1": [
    {
      id: "msg-1-1",
      conversationId: "conv-1",
      senderId: "user-1",
      senderName: "Esther Howard",
      content: "Hey! Can we discuss the budget for the new project?",
      read: false,
      createdAt: fiveMinutesAgo,
      updatedAt: fiveMinutesAgo,
    },
    {
      id: "msg-1-2",
      conversationId: "conv-1",
      senderId: "current-user",
      senderName: "John Doe",
      content: "Sure, I'm available now. What would you like to know?",
      read: true,
      createdAt: new Date(fiveMinutesAgo.getTime() - 2 * 60 * 1000),
      updatedAt: new Date(fiveMinutesAgo.getTime() - 2 * 60 * 1000),
    },
    {
      id: "msg-1-3",
      conversationId: "conv-1",
      senderId: "user-1",
      senderName: "Esther Howard",
      content: "I need to understand the cost breakdown for Q1.",
      read: false,
      createdAt: new Date(fiveMinutesAgo.getTime() - 1 * 60 * 1000),
      updatedAt: new Date(fiveMinutesAgo.getTime() - 1 * 60 * 1000),
    },
  ],
  "conv-2": [
    {
      id: "msg-2-1",
      conversationId: "conv-2",
      senderId: "user-2",
      senderName: "Jacob Jones",
      content: "The task is progressing well. We're at 75% completion.",
      read: true,
      createdAt: oneHourAgo,
      updatedAt: oneHourAgo,
    },
    {
      id: "msg-2-2",
      conversationId: "conv-2",
      senderId: "current-user",
      senderName: "John Doe",
      content: "Thanks for the update on the task progress!",
      read: true,
      createdAt: new Date(oneHourAgo.getTime() - 5 * 60 * 1000),
      updatedAt: new Date(oneHourAgo.getTime() - 5 * 60 * 1000),
    },
  ],
  "conv-3": [
    {
      id: "msg-3-1",
      conversationId: "conv-3",
      senderId: "user-3",
      senderName: "Cody Fisher",
      content: "I'll review the contract and get back to you.",
      read: true,
      createdAt: yesterday,
      updatedAt: yesterday,
    },
  ],
  "conv-4": [
    {
      id: "msg-4-1",
      conversationId: "conv-4",
      senderId: "user-1",
      senderName: "Esther Howard",
      content: "The sprint review meeting is scheduled for tomorrow at 2 PM.",
      read: false,
      createdAt: oneHourAgo,
      updatedAt: oneHourAgo,
    },
    {
      id: "msg-4-2",
      conversationId: "conv-4",
      senderId: "user-2",
      senderName: "Jacob Jones",
      content: "I'll prepare the presentation slides.",
      read: true,
      createdAt: new Date(oneHourAgo.getTime() - 30 * 60 * 1000),
      updatedAt: new Date(oneHourAgo.getTime() - 30 * 60 * 1000),
    },
  ],
};

