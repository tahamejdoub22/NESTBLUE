import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Conversation } from "./entities/conversation.entity";
import { Message } from "./entities/message.entity";
import { UsersService } from "../users/users.service";
import { CreateConversationDto } from "./dto/create-conversation.dto";
import { CreateMessageDto } from "./dto/create-message.dto";

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Conversation)
    private conversationsRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    private usersService: UsersService,
  ) {}

  // Conversations
  async createConversation(
    createDto: CreateConversationDto,
    userId: string,
  ): Promise<Conversation> {
    // Ensure userId is in participantIds
    const participantIds = createDto.participantIds || [userId];
    if (!participantIds.includes(userId)) {
      participantIds.push(userId);
    }

    // Auto-generate name for direct conversations if not provided
    let conversationName = createDto.name;
    if (
      !conversationName &&
      createDto.type === "direct" &&
      participantIds.length === 2
    ) {
      // For direct conversations, generate name from participant names
      const otherParticipantId = participantIds.find((id) => id !== userId);
      if (otherParticipantId) {
        try {
          const otherUser = await this.usersService.findOne(otherParticipantId);
          conversationName = otherUser.name;
        } catch (error) {
          conversationName = "Direct Message";
        }
      }
    }

    const conversation = this.conversationsRepository.create({
      ...createDto,
      name: conversationName || createDto.name || "Group Chat",
      participantIds,
      projectUid: createDto.projectUid,
      spaceId: createDto.spaceId,
    });
    return this.conversationsRepository.save(conversation);
  }

  async findAllConversations(userId: string): Promise<any[]> {
    // PostgreSQL array contains query
    const conversations = await this.conversationsRepository
      .createQueryBuilder("conversation")
      .where(":userId = ANY(conversation.participantIds)", { userId })
      .leftJoinAndSelect("conversation.messages", "messages")
      .orderBy("conversation.updatedAt", "DESC")
      .getMany();

    // Load all unique participant user IDs
    const allParticipantIds = new Set<string>();
    conversations.forEach((conv) => {
      conv.participantIds.forEach((id) => allParticipantIds.add(id));
    });

    // Load all users in parallel
    const userMap = new Map<string, { name: string; avatar?: string }>();
    const uniqueIds = Array.from(allParticipantIds);

    if (uniqueIds.length > 0) {
      const users = await this.usersService.findByIds(uniqueIds);
      const foundUserIds = new Set<string>();
      users.forEach((user) => {
        userMap.set(user.id, { name: user.name, avatar: user.avatar });
        foundUserIds.add(user.id);
      });

      uniqueIds.forEach((id) => {
        if (!foundUserIds.has(id)) {
          userMap.set(id, { name: "Unknown User" });
        }
      });
    }

    // Transform to match frontend format
    return conversations.map((conv) => {
      const sortedMessages =
        conv.messages?.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ) || [];
      const lastMessage =
        sortedMessages.length > 0
          ? sortedMessages[sortedMessages.length - 1]
          : undefined;

      // Auto-generate name for direct conversations if not set
      let conversationName = conv.name;
      let conversationAvatar = undefined;

      if (conv.type === "direct" && conv.participantIds.length === 2) {
        const otherParticipantId = conv.participantIds.find(
          (id) => id !== userId,
        );
        if (otherParticipantId) {
          const otherUser = userMap.get(otherParticipantId);
          if (!conversationName) {
            conversationName = otherUser?.name || "Direct Message";
          }
          conversationAvatar = otherUser?.avatar;
        }
      }

      return {
        id: conv.id,
        name: conversationName || conv.name || "Group Chat",
        type: conv.type,
        participants: conv.participantIds.map((id) => {
          const user = userMap.get(id);
          return {
            id,
            name: user?.name || "Unknown User",
            status: "offline" as const,
            avatar: user?.avatar,
          };
        }),
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              conversationId: lastMessage.conversationId,
              senderId: lastMessage.senderId,
              senderName: lastMessage.senderName,
              senderAvatar: lastMessage.senderAvatar,
              content: lastMessage.content,
              read: lastMessage.read,
              createdAt: lastMessage.createdAt,
              updatedAt: lastMessage.updatedAt,
            }
          : undefined,
        unreadCount: conv.unreadCount,
        avatar: conversationAvatar,
        isPinned: conv.isPinned,
        isArchived: conv.isArchived,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      };
    });
  }

  async findConversationById(
    id: string,
    userId?: string,
  ): Promise<Conversation> {
    const conversation = await this.conversationsRepository.findOne({
      where: { id },
      relations: ["messages"],
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    if (userId && !conversation.participantIds.includes(userId)) {
      throw new ForbiddenException(
        "You are not a participant in this conversation",
      );
    }

    return conversation;
  }

  private async checkConversationAccess(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    const conversation = await this.conversationsRepository.findOne({
      where: { id: conversationId },
      select: ["id", "participantIds"],
    });

    if (!conversation) {
      throw new NotFoundException(
        `Conversation with ID ${conversationId} not found`,
      );
    }

    if (!conversation.participantIds.includes(userId)) {
      throw new ForbiddenException(
        "You are not a participant in this conversation",
      );
    }
  }

  async updateConversation(
    id: string,
    updateData: Partial<Conversation>,
  ): Promise<Conversation> {
    const conversation = await this.findConversationById(id);
    Object.assign(conversation, updateData);
    return this.conversationsRepository.save(conversation);
  }

  async deleteConversation(id: string, userId: string): Promise<void> {
    const conversation = await this.findConversationById(id, userId);
    await this.conversationsRepository.remove(conversation);
  }

  async markConversationRead(id: string, userId: string): Promise<void> {
    // Verify access
    await this.checkConversationAccess(id, userId);

    // Mark conversation as read (reset unread count)
    await this.conversationsRepository.update(id, { unreadCount: 0 });

    // Mark all messages in the conversation as read (except those sent by the user)
    // Use query builder for proper TypeORM syntax
    await this.messagesRepository
      .createQueryBuilder()
      .update(Message)
      .set({ read: true })
      .where("conversationId = :conversationId", { conversationId: id })
      .andWhere("senderId != :userId", { userId })
      .andWhere("read = :read", { read: false })
      .execute();
  }

  // Messages
  async createMessage(
    conversationId: string,
    createDto: CreateMessageDto,
    userId: string,
  ): Promise<Message> {
    // Get conversation to check participants
    const conversation = await this.findConversationById(
      conversationId,
      userId,
    );

    const user = await this.usersService.findOne(userId);
    const message = this.messagesRepository.create({
      ...createDto,
      conversationId,
      senderId: userId,
      senderName: user.name,
      senderAvatar: user.avatar,
      read: false, // Messages are unread by default
    });

    const savedMessage = await this.messagesRepository.save(message);

    // Update conversation: increment unread count only for OTHER participants (not the sender)
    const otherParticipantIds = conversation.participantIds.filter(
      (id) => id !== userId,
    );
    if (otherParticipantIds.length > 0) {
      await this.conversationsRepository.increment(
        { id: conversationId },
        "unreadCount",
        1,
      );
    }

    // Update conversation's updatedAt timestamp to reflect latest activity
    await this.conversationsRepository.update(conversationId, {
      updatedAt: new Date(),
    });

    return savedMessage;
  }

  async findMessagesByConversation(
    conversationId: string,
    userId: string,
  ): Promise<Message[]> {
    // Verify access first
    await this.checkConversationAccess(conversationId, userId);

    return this.messagesRepository.find({
      where: { conversationId },
      order: { createdAt: "ASC" },
    });
  }

  async findMessageById(id: string): Promise<Message> {
    const message = await this.messagesRepository.findOne({ where: { id } });

    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    return message;
  }

  async updateMessage(
    id: string,
    updateData: Partial<Message>,
  ): Promise<Message> {
    const message = await this.findMessageById(id);
    Object.assign(message, updateData);
    return this.messagesRepository.save(message);
  }

  async deleteMessage(id: string): Promise<void> {
    const message = await this.findMessageById(id);
    await this.messagesRepository.remove(message);
  }

  async markMessageRead(id: string): Promise<void> {
    await this.messagesRepository.update(id, { read: true });
  }
}
