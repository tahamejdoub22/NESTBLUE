import { RateLimiterGuard } from "./rate-limiter.guard";
import { ExecutionContext, HttpException, HttpStatus } from "@nestjs/common";

describe("RateLimiterGuard", () => {
  let guard: RateLimiterGuard;

  const createMockContext = (ip: string) => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { "x-forwarded-for": ip },
          socket: { remoteAddress: ip },
        }),
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    guard = new RateLimiterGuard();
    // Clear static storage between tests
    (RateLimiterGuard as any).limits.clear();
  });

  afterEach(() => {
    (RateLimiterGuard as any).limits.clear();
  });

  it("should allow requests under the limit", () => {
    const context = createMockContext("127.0.0.1");
    // Default limit is 5
    expect(guard.canActivate(context)).toBe(true);
    expect(guard.canActivate(context)).toBe(true);
    expect(guard.canActivate(context)).toBe(true);
    expect(guard.canActivate(context)).toBe(true);
    expect(guard.canActivate(context)).toBe(true);
  });

  it("should block requests over the limit", () => {
    const context = createMockContext("127.0.0.1");
    // Consume 5 requests
    for (let i = 0; i < 5; i++) {
      guard.canActivate(context);
    }

    // 6th request should fail
    try {
      guard.canActivate(context);
      throw new Error("Should have thrown HttpException");
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  });

  it("should track different IPs separately", () => {
    const context1 = createMockContext("127.0.0.1");
    const context2 = createMockContext("192.168.1.1");

    // Max out IP 1
    for (let i = 0; i < 5; i++) {
      guard.canActivate(context1);
    }

    // IP 1 blocked
    try {
      guard.canActivate(context1);
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
    }

    // IP 2 should still be allowed
    expect(guard.canActivate(context2)).toBe(true);
  });
});
