/**
 * WebSocket Service for Real-time Notifications
 */

import { io, Socket } from "socket.io-client";

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000";

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  private isConnecting = false;

  /**
   * Connect to WebSocket server
   */
  connect(token: string): void {
    if (this.socket?.connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      this.socket = io(`${WS_BASE_URL}/notifications`, {
        auth: {
          token,
        },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      this.socket.on("connect", () => {
        console.log("✅ WebSocket connected");
        this.isConnecting = false;
        this.emit("connected", {});
      });

      this.socket.on("disconnect", (reason) => {
        console.log("❌ WebSocket disconnected:", reason);
        this.isConnecting = false;
        this.emit("disconnected", { reason });
      });

      this.socket.on("connect_error", (error) => {
        console.error("❌ WebSocket connection error:", error);
        this.isConnecting = false;
        this.emit("error", { error });
      });

      // Listen for notification events
      this.socket.on("notification", (notification: any) => {
        this.emit("notification", notification);
      });

      this.socket.on("unread-count", (data: { count: number }) => {
        this.emit("unread-count", data);
      });
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
      this.isConnecting = false;
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
    this.isConnecting = false;
  }

  /**
   * Subscribe to an event
   */
  on(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, callback?: Function): void {
    if (!callback) {
      this.listeners.delete(event);
      return;
    }

    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Emit event to all listeners
   */
  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Singleton instance
export const websocketService = new WebSocketService();

