import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class RateLimiterGuard implements CanActivate {
  // Use a static map to share state across instances
  // Key: IP address
  // Value: { count: number, expiresAt: number }
  private static readonly requests = new Map<string, { count: number; expiresAt: number }>();

  // Configuration: 5 attempts per 15 minutes
  private static readonly WINDOW_MS = 15 * 60 * 1000;
  private static readonly MAX_REQUESTS = 5;

  // Cleanup interval
  private static cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Start cleanup interval if not already started
    if (!RateLimiterGuard.cleanupInterval) {
      RateLimiterGuard.cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [key, val] of RateLimiterGuard.requests.entries()) {
          if (now > val.expiresAt) {
            RateLimiterGuard.requests.delete(key);
          }
        }
      }, 60 * 60 * 1000); // Clean up every hour

      // Prevent this interval from keeping the process alive
      if (RateLimiterGuard.cleanupInterval.unref) {
        RateLimiterGuard.cleanupInterval.unref();
      }
    }
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // Get IP address
    const ip = request.ip || request.headers['x-forwarded-for'] || request.socket?.remoteAddress || 'unknown';

    const now = Date.now();
    const record = RateLimiterGuard.requests.get(ip);

    if (record) {
      if (now > record.expiresAt) {
        // Expired, reset
        RateLimiterGuard.requests.set(ip, { count: 1, expiresAt: now + RateLimiterGuard.WINDOW_MS });
      } else {
        if (record.count >= RateLimiterGuard.MAX_REQUESTS) {
           throw new HttpException({
             statusCode: HttpStatus.TOO_MANY_REQUESTS,
             message: 'Too many login attempts, please try again later',
             error: 'Too Many Requests'
           }, HttpStatus.TOO_MANY_REQUESTS);
        }
        record.count++;
      }
    } else {
      RateLimiterGuard.requests.set(ip, { count: 1, expiresAt: now + RateLimiterGuard.WINDOW_MS });
    }

    return true;
  }
}
