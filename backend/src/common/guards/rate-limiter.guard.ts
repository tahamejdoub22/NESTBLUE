import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";

@Injectable()
export class RateLimiterGuard implements CanActivate {
  private readonly logger = new Logger(RateLimiterGuard.name);

  // Static storage to persist state across instances
  private static readonly limits = new Map<
    string,
    { count: number; expiresAt: number }
  >();
  private static cleanupInterval: NodeJS.Timeout;

  // Limit: 5 requests per 15 minutes
  private readonly MAX_REQUESTS = 5;
  private readonly WINDOW_MS = 15 * 60 * 1000;

  constructor() {
    // Ensure cleanup runs periodically
    if (!RateLimiterGuard.cleanupInterval) {
      RateLimiterGuard.cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [ip, record] of RateLimiterGuard.limits.entries()) {
          if (now > record.expiresAt) {
            RateLimiterGuard.limits.delete(ip);
          }
        }
      }, 60 * 1000); // Check every minute
      RateLimiterGuard.cleanupInterval.unref();
    }
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Determine IP address
    let ip = request.headers["x-forwarded-for"];
    if (Array.isArray(ip)) {
      ip = ip[0];
    } else if (typeof ip === "string") {
      ip = ip.split(",")[0].trim();
    } else {
      ip = request.socket.remoteAddress;
    }

    if (!ip) {
      this.logger.warn("Could not determine client IP for rate limiting");
      return true; // Fail open
    }

    const now = Date.now();
    const record = RateLimiterGuard.limits.get(ip);

    if (record) {
      if (now > record.expiresAt) {
        // Window expired, reset
        RateLimiterGuard.limits.set(ip, {
          count: 1,
          expiresAt: now + this.WINDOW_MS,
        });
      } else {
        if (record.count >= this.MAX_REQUESTS) {
          throw new HttpException(
            {
              statusCode: HttpStatus.TOO_MANY_REQUESTS,
              message: "Too many login attempts. Please try again later.",
              error: "Too Many Requests",
            },
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }
        record.count++;
      }
    } else {
      // New record
      RateLimiterGuard.limits.set(ip, {
        count: 1,
        expiresAt: now + this.WINDOW_MS,
      });
    }

    return true;
  }
}
