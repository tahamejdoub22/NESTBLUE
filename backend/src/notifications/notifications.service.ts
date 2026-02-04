import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Notification, NotificationType } from "./entities/notification.entity";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { NotificationsGateway } from "./notifications.gateway";

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    @Inject(forwardRef(() => NotificationsGateway))
    private notificationsGateway: NotificationsGateway,
  ) {}

  async create(createDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationsRepository.create(createDto);
    const savedNotification =
      await this.notificationsRepository.save(notification);

    // Emit real-time notification via WebSocket
    try {
      this.notificationsGateway.sendNotificationToUser(
        createDto.userId,
        savedNotification,
      );

      // Also update unread count
      const unreadCount = await this.getUnreadCount(createDto.userId);
      this.notificationsGateway.sendUnreadCountUpdate(
        createDto.userId,
        unreadCount,
      );
    } catch (error) {
      console.error("Error emitting notification via WebSocket:", error);
      // Don't fail the notification creation if WebSocket fails
    }

    return savedNotification;
  }

  async findAll(userId: string): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async markRead(id: string): Promise<void> {
    const notification = await this.findOne(id);
    await this.notificationsRepository.update(id, { read: true });

    // Emit unread count update
    try {
      const unreadCount = await this.getUnreadCount(notification.userId);
      this.notificationsGateway.sendUnreadCountUpdate(
        notification.userId,
        unreadCount,
      );
    } catch (error) {
      console.error("Error emitting unread count update:", error);
    }
  }

  async markAllRead(userId: string): Promise<void> {
    await this.notificationsRepository.update({ userId }, { read: true });

    // Emit unread count update
    try {
      const unreadCount = await this.getUnreadCount(userId);
      this.notificationsGateway.sendUnreadCountUpdate(userId, unreadCount);
    } catch (error) {
      console.error("Error emitting unread count update:", error);
    }
  }

  async delete(id: string): Promise<void> {
    const notification = await this.findOne(id);
    const userId = notification.userId;
    await this.notificationsRepository.remove(notification);

    // Emit unread count update
    try {
      const unreadCount = await this.getUnreadCount(userId);
      this.notificationsGateway.sendUnreadCountUpdate(userId, unreadCount);
    } catch (error) {
      console.error("Error emitting unread count update:", error);
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationsRepository.count({
      where: { userId, read: false },
    });
  }

  /**
   * Helper method to create and send notifications easily
   */
  async notifyUser(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = NotificationType.INFO,
    options?: {
      actionUrl?: string;
      actionLabel?: string;
      icon?: string;
      projectId?: string;
      taskId?: string;
    },
  ): Promise<Notification> {
    return this.create({
      userId,
      title,
      message,
      type,
      ...options,
    });
  }

  /**
   * Notify multiple users
   */
  async notifyUsers(
    userIds: string[],
    title: string,
    message: string,
    type: NotificationType = NotificationType.INFO,
    options?: {
      actionUrl?: string;
      actionLabel?: string;
      icon?: string;
      projectId?: string;
      taskId?: string;
    },
  ): Promise<Notification[]> {
    if (!userIds || userIds.length === 0) {
      return [];
    }

    // Batch create notifications
    const notifications = userIds.map((userId) =>
      this.notificationsRepository.create({
        userId,
        title,
        message,
        type,
        ...options,
      }),
    );

    // Single DB query for all inserts
    const savedNotifications =
      await this.notificationsRepository.save(notifications);

    // Send real-time notifications via WebSocket
    savedNotifications.forEach((notification) => {
      try {
        this.notificationsGateway.sendNotificationToUser(
          notification.userId,
          notification,
        );
      } catch (error) {
        console.error(
          `Error sending notification to user ${notification.userId}:`,
          error,
        );
      }
    });

    // Optimize unread count updates:
    // Instead of N queries (one per user), do 1 query to get counts for all users
    try {
      const uniqueUserIds = [...new Set(userIds)];

      const counts = await this.notificationsRepository
        .createQueryBuilder("n")
        .select("n.userId", "userId")
        .addSelect("COUNT(n.id)", "count")
        .where("n.userId IN (:...userIds)", { userIds: uniqueUserIds })
        .andWhere("n.read = :read", { read: false })
        .groupBy("n.userId")
        .getRawMany();

      const countMap = new Map<string, number>();
      counts.forEach((row) => {
        countMap.set(row.userId, parseInt(row.count, 10));
      });

      uniqueUserIds.forEach((userId) => {
        const count = countMap.get(userId) || 0;
        this.notificationsGateway.sendUnreadCountUpdate(userId, count);
      });
    } catch (error) {
      console.error("Error updating unread counts:", error);
    }

    return savedNotifications;
  }
}
