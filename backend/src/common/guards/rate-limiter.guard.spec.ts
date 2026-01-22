import { RateLimiterGuard } from './rate-limiter.guard';
import { ExecutionContext, HttpStatus } from '@nestjs/common';

describe('RateLimiterGuard', () => {
  let guard: RateLimiterGuard;
  let mockContext: ExecutionContext;
  let mockRequest: any;

  beforeEach(() => {
    guard = new RateLimiterGuard();
    mockRequest = {
      headers: {},
      connection: { remoteAddress: '127.0.0.1' },
    };
    mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ExecutionContext;
  });

  it('should allow requests under the limit', () => {
    // Limit is 5
    expect(guard.canActivate(mockContext)).toBe(true);
    expect(guard.canActivate(mockContext)).toBe(true);
    expect(guard.canActivate(mockContext)).toBe(true);
    expect(guard.canActivate(mockContext)).toBe(true);
    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should block requests over the limit', () => {
    // Limit is 5
    for (let i = 0; i < 5; i++) {
      guard.canActivate(mockContext);
    }

    try {
      guard.canActivate(mockContext);
      fail('Should have thrown HttpException');
    } catch (error) {
      expect(error.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
      expect(error.getResponse().message).toBe('Too many requests, please try again later.');
    }
  });

  it('should reset after TTL', async () => {
    // This test relies on manipulating time or the guard exposing its state.
    // Since we can't easily mock Date.now() without extensive setup or refactoring the guard to accept a time provider,
    // we will rely on the logic being correct.
    // Ideally we would inject a TimeProvider.

    // For this simple test, we can override the TTL in the instance if it was protected/public, but it's private.
    // We can use jest.useFakeTimers()

    jest.useFakeTimers();
    const now = Date.now();
    jest.setSystemTime(now);

    for (let i = 0; i < 5; i++) {
      guard.canActivate(mockContext);
    }

    // Fast forward 61 seconds
    jest.setSystemTime(now + 61000);

    expect(guard.canActivate(mockContext)).toBe(true);

    jest.useRealTimers();
  });

  it('should handle different IPs independently', () => {
    const context1 = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: {},
            connection: { remoteAddress: '127.0.0.1' },
          }),
        }),
      } as unknown as ExecutionContext;

    const context2 = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: {},
            connection: { remoteAddress: '192.168.1.1' },
          }),
        }),
      } as unknown as ExecutionContext;

      // Exhaust IP 1
      for (let i = 0; i < 5; i++) {
        guard.canActivate(context1);
      }

      // IP 2 should still be allowed
      expect(guard.canActivate(context2)).toBe(true);
  });
});
