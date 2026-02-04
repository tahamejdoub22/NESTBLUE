import { Test, TestingModule } from "@nestjs/testing";
import { NotificationsService } from "./notifications.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Notification, NotificationType } from "./entities/notification.entity";
import { NotificationsGateway } from "./notifications.gateway";
import { Repository } from "typeorm";

describe("NotificationsService", () => {
  let service: NotificationsService;
  let repository: Repository<Notification>;
  let gateway: NotificationsGateway;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
    })),
  };

  const mockGateway = {
    sendNotificationToUser: jest.fn(),
    sendUnreadCountUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockRepository,
        },
        {
          provide: NotificationsGateway,
          useValue: mockGateway,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    repository = module.get<Repository<Notification>>(
      getRepositoryToken(Notification),
    );
    gateway = module.get<NotificationsGateway>(NotificationsGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("notifyUsers", () => {
    it("should batch create notifications and optimize unread counts", async () => {
      const userIds = ["user1", "user2", "user3"];
      const title = "Test Title";
      const message = "Test Message";

      const savedNotifications = userIds.map((userId) => ({
        id: `notification-${userId}`,
        userId,
        title,
        message,
        read: false,
        createdAt: new Date(),
      }));

      mockRepository.create.mockImplementation((dto) => dto);
      mockRepository.save.mockResolvedValue(savedNotifications);

      // Mock aggregated counts
      const mockCounts = [
        { userId: "user1", count: "5" },
        { userId: "user2", count: "2" },
        // user3 has 0 unread
      ];

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockCounts),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.notifyUsers(userIds, title, message);

      // Verify batch insert
      expect(mockRepository.create).toHaveBeenCalledTimes(3);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ userId: "user1" }),
          expect.objectContaining({ userId: "user2" }),
          expect.objectContaining({ userId: "user3" }),
        ]),
      );

      // Verify socket notifications
      expect(gateway.sendNotificationToUser).toHaveBeenCalledTimes(3);

      // Verify optimized unread count query
      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        "n.userId IN (:...userIds)",
        { userIds: expect.arrayContaining(userIds) },
      );
      expect(mockQueryBuilder.groupBy).toHaveBeenCalledWith("n.userId");

      // Verify socket unread updates
      expect(gateway.sendUnreadCountUpdate).toHaveBeenCalledTimes(3);
      expect(gateway.sendUnreadCountUpdate).toHaveBeenCalledWith("user1", 5);
      expect(gateway.sendUnreadCountUpdate).toHaveBeenCalledWith("user2", 2);
      expect(gateway.sendUnreadCountUpdate).toHaveBeenCalledWith("user3", 0);
    });

    it("should handle empty user list", async () => {
      await service.notifyUsers([], "Title", "Message");
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});
