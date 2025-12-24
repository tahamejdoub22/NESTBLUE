import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients = new Map<string, string>(); // userId -> socketId

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake auth or query
      const token = client.handshake.auth?.token || client.handshake.query?.token;
      
      if (!token || typeof token !== 'string') {
        console.log('❌ No token provided, disconnecting client');
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Attach userId to socket
      client.userId = payload.userId || payload.sub;
      
      if (!client.userId) {
        console.log('❌ No userId in token, disconnecting client');
        client.disconnect();
        return;
      }

      // Join room for this user
      await client.join(`user:${client.userId}`);
      
      // Store connection
      this.connectedClients.set(client.userId, client.id);
      
      console.log(`✅ Client connected: ${client.userId} (socket: ${client.id})`);
    } catch (error) {
      console.error('❌ Authentication error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedClients.delete(client.userId);
      console.log(`👋 Client disconnected: ${client.userId} (socket: ${client.id})`);
    }
  }

  /**
   * Send notification to a specific user
   */
  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  /**
   * Send notification to multiple users
   */
  sendNotificationToUsers(userIds: string[], notification: any) {
    userIds.forEach(userId => {
      this.sendNotificationToUser(userId, notification);
    });
  }

  /**
   * Send unread count update to a user
   */
  sendUnreadCountUpdate(userId: string, count: number) {
    this.server.to(`user:${userId}`).emit('unread-count', { count });
  }

  /**
   * Get connected clients count
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }
}

