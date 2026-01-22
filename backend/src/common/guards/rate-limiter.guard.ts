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
  private requests = new Map<string, { count: number; resetTime: number }>();
  private readonly LIMIT = 5;
  private readonly TTL = 60 * 1000; // 1 minute
  private readonly logger = new Logger(RateLimiterGuard.name);

  constructor() {
    // Periodic cleanup to prevent memory leaks from IP spoofing
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      this.requests.forEach((record, key) => {
        if (now > record.resetTime) {
          this.requests.delete(key);
        }
      });
    }, 5 * 60 * 1000); // Run every 5 minutes

    // Ensure this interval doesn't prevent the application from shutting down
    if (cleanupInterval.unref) {
      cleanupInterval.unref();
    }
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // Use x-forwarded-for if behind proxy, or remoteAddress
    // Note: In production with a proxy, ensure 'trust proxy' is set in express
    const ip =
      request.headers['x-forwarded-for'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      request.ip;

    if (!ip) {
      this.logger.warn('Could not determine IP address for rate limiting');
      return true; // Fail open if IP can't be determined
    }

    const now = Date.now();
    const cleanIp = Array.isArray(ip) ? ip[0] : ip;

    // Check existing record
    if (this.requests.has(cleanIp)) {
      const record = this.requests.get(cleanIp);

      // If expired, reset
      if (now > record.resetTime) {
        this.requests.set(cleanIp, { count: 1, resetTime: now + this.TTL });
        return true;
      }

      // Check limit
      if (record.count >= this.LIMIT) {
        const retryAfter = Math.ceil((record.resetTime - now) / 1000);
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: 'Too many requests, please try again later.',
            retryAfter,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      record.count++;
      return true;
    }

    // New record
    this.requests.set(cleanIp, { count: 1, resetTime: now + this.TTL });
    return true;
  }
}
