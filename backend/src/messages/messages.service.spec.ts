import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
  genSalt: jest.fn(),
}));
import { MessagesService } from './messages.service';
import { UsersService } from '../users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';

describe('MessagesService', () => {
  let service: MessagesService;
  let usersService: Partial<UsersService>;
  let conversationsRepository: any;
  let messagesRepository: any;

  beforeEach(async () => {
    // Mock repositories
    conversationsRepository = {
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      }),
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      increment: jest.fn(),
    };

    messagesRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    usersService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: getRepositoryToken(Conversation),
          useValue: conversationsRepository,
        },
        {
          provide: getRepositoryToken(Message),
          useValue: messagesRepository,
        },
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAllConversations", () => {
    it("should return conversations with avatar for direct messages", async () => {
      const userId = "user-1";
      const otherUserId = "user-2";

      const mockConversations = [
        {
          id: "conv-1",
          name: "", // Empty name to trigger auto-generation
          type: "direct",
          participantIds: [userId, otherUserId],
          unreadCount: 0,
          isPinned: false,
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          messages: [],
        },
      ];

      // Mock conversation query
      conversationsRepository
        .createQueryBuilder()
        .getMany.mockResolvedValue(mockConversations);

      // Mock user lookup
      (usersService.findOne as jest.Mock).mockImplementation((id) => {
        if (id === userId) {
          return Promise.resolve({
            id: userId,
            name: "Current User",
            avatar: "my-avatar.png",
          });
        } else if (id === otherUserId) {
          return Promise.resolve({
            id: otherUserId,
            name: "Other User",
            avatar: "other-avatar.png",
          });
        }
        return Promise.resolve(null);
      });

      const results = await service.findAllConversations(userId);

      expect(results).toHaveLength(1);
      const result = results[0];

      // Check if avatar is set correctly for direct message
      expect(result.avatar).toBe("other-avatar.png");
      expect(result.name).toBe("Other User");
    });

    it("should return undefined avatar for group conversations", async () => {
      const userId = "user-1";

      const mockConversations = [
        {
          id: "conv-group",
          name: "My Group",
          type: "group",
          participantIds: [userId, "user-2", "user-3"],
          unreadCount: 0,
          isPinned: false,
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          messages: [],
        },
      ];

      // Mock conversation query
      conversationsRepository
        .createQueryBuilder()
        .getMany.mockResolvedValue(mockConversations);

      // Mock user lookup
      (usersService.findOne as jest.Mock).mockResolvedValue({
        id: "any",
        name: "User",
        avatar: "avatar.png",
      });

      const results = await service.findAllConversations(userId);

      expect(results).toHaveLength(1);
      const result = results[0];

      // Check if avatar is undefined for group message
      expect(result.avatar).toBeUndefined();
    });
  });

  describe('findConversationById', () => {
    it('should return conversation if user is participant', async () => {
      const userId = 'user-1';
      const conversationId = 'conv-1';
      const mockConversation = {
        id: conversationId,
        participantIds: [userId, 'user-2'],
      };

      conversationsRepository.findOne.mockResolvedValue(mockConversation);

      const result = await service.findConversationById(conversationId, userId);
      expect(result).toEqual(mockConversation);
    });

    it('should throw ForbiddenException if user is not participant', async () => {
      const userId = 'user-1';
      const conversationId = 'conv-1';
      const mockConversation = {
        id: conversationId,
        participantIds: ['user-2', 'user-3'],
      };

      conversationsRepository.findOne.mockResolvedValue(mockConversation);

      await expect(service.findConversationById(conversationId, userId))
        .rejects
        .toThrow(ForbiddenException);
    });
  });
});
