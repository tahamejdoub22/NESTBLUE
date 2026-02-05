import { RateLimiterGuard } from "./rate-limiter.guard";
import { ExecutionContext, HttpException } from "@nestjs/common";

describe("RateLimiterGuard", () => {
  let guard: RateLimiterGuard;
  let mockContext: ExecutionContext;
  let mockRequest: any;

  beforeEach(() => {
    guard = new RateLimiterGuard();
    mockRequest = {
      ip: "127.0.0.1",
      socket: { remoteAddress: "127.0.0.1" },
    };
    mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;
  });

  it("should be defined", () => {
    expect(guard).toBeDefined();
  });

  it("should allow requests under the limit", () => {
    expect(guard.canActivate(mockContext)).toBe(true);
    expect(guard.canActivate(mockContext)).toBe(true);
    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it("should block requests over the limit", () => {
    // Limit is 5
    for (let i = 0; i < 5; i++) {
      guard.canActivate(mockContext);
    }

    expect(() => guard.canActivate(mockContext)).toThrow(
      new HttpException("Too many requests. Please try again later.", 429),
    );
  });

  it("should track different IPs separately", () => {
    // Fill up quota for IP 1
    for (let i = 0; i < 5; i++) {
      guard.canActivate(mockContext);
    }
    expect(() => guard.canActivate(mockContext)).toThrow(HttpException);

    // IP 2 should be fine
    const mockRequest2 = {
      ip: "192.168.1.1",
      socket: { remoteAddress: "192.168.1.1" },
    };
    const mockContext2 = {
      switchToHttp: () => ({
        getRequest: () => mockRequest2,
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(mockContext2)).toBe(true);
  });
});
