import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

@Injectable()
export class RateLimiterGuard implements CanActivate {
  private requests = new Map<string, { count: number; expiresAt: number }>();
  private readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  private readonly MAX_REQUESTS = 5;

  constructor() {
    // Self-cleaning mechanism: run every 5 minutes
    const cleanupInterval = setInterval(
      () => {
        const now = Date.now();
        for (const [ip, data] of this.requests.entries()) {
          if (now > data.expiresAt) {
            this.requests.delete(ip);
          }
        }
      },
      5 * 60 * 1000,
    );

    // Prevent this interval from keeping the process alive
    if (cleanupInterval.unref) {
      cleanupInterval.unref();
    }
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // Use request.ip or connection.remoteAddress
    // explicit check to avoid manual X-Forwarded-For parsing which can be spoofed without proper proxy config
    const ip = request.ip || request.socket?.remoteAddress || "unknown";

    const now = Date.now();
    const record = this.requests.get(ip);

    if (!record || now > record.expiresAt) {
      this.requests.set(ip, {
        count: 1,
        expiresAt: now + this.WINDOW_MS,
      });
      return true;
    }

    if (record.count >= this.MAX_REQUESTS) {
      throw new HttpException(
        "Too many requests. Please try again later.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    record.count++;
    return true;
  }
}
