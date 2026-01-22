import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Injectable()
export class RateLimiterGuard implements CanActivate {
  private readonly logger = new Logger(RateLimiterGuard.name);

  // Static storage to share state across potential multiple instances
  // Key: IP address, Value: { count, expiresAt }
  private static readonly storage = new Map<string, { count: number; expiresAt: number }>();

  // Configuration: 5 requests per 15 minutes
  private readonly WINDOW_MS = 15 * 60 * 1000;
  private readonly MAX_REQUESTS = 5;

  constructor() {
    // Self-cleaning mechanism to remove expired entries
    const cleanup = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of RateLimiterGuard.storage.entries()) {
        if (now > value.expiresAt) {
          RateLimiterGuard.storage.delete(key);
        }
      }
    }, 60000); // Check every minute

    // Allow process to exit even if this interval is running
    if (cleanup.unref) {
      cleanup.unref();
    }
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Use framework's IP resolution which respects trust proxy settings
    // This prevents IP spoofing via fake X-Forwarded-For headers
    const ip = request.ip || request.socket?.remoteAddress;

    if (!ip) {
      // If we can't identify the caller, we can't rate limit effectively.
      // Log warning and fail open to avoid blocking legitimate users.
      this.logger.warn('RateLimiter: Could not determine IP address');
      return true;
    }

    const now = Date.now();
    const record = RateLimiterGuard.storage.get(ip);

    // If no record exists or the window has expired, start a new window
    if (!record || now > record.expiresAt) {
      RateLimiterGuard.storage.set(ip, {
        count: 1,
        expiresAt: now + this.WINDOW_MS,
      });
      return true;
    }

    // Check if limit exceeded
    if (record.count >= this.MAX_REQUESTS) {
      this.logger.warn(`Rate limit exceeded for IP: ${ip}`);
      throw new HttpException(
        'Too many login attempts. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Increment count
    record.count++;
    return true;
  }

  // Helper for testing to reset storage
  static reset() {
    this.storage.clear();
  }
}
