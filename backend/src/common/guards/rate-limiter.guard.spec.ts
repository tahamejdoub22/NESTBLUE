import { RateLimiterGuard } from './rate-limiter.guard';
import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

describe('RateLimiterGuard', () => {
  let guard: RateLimiterGuard;
  let mockContext: Partial<ExecutionContext>;
  let mockRequest: any;

  beforeEach(() => {
    RateLimiterGuard.reset(); // Clear storage before each test
    guard = new RateLimiterGuard();

    mockRequest = {
      ip: '127.0.0.1',
      headers: {},
      socket: { remoteAddress: '127.0.0.1' },
    };

    mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      } as any),
    };
  });

  it('should allow requests under the limit', () => {
    // 5 requests allowed
    for (let i = 0; i < 5; i++) {
      expect(guard.canActivate(mockContext as ExecutionContext)).toBe(true);
    }
  });

  it('should block the 6th request', () => {
    // 5 requests allowed
    for (let i = 0; i < 5; i++) {
      guard.canActivate(mockContext as ExecutionContext);
    }

    // 6th request should fail
    expect(() => guard.canActivate(mockContext as ExecutionContext)).toThrow(
      HttpException,
    );

    try {
        guard.canActivate(mockContext as ExecutionContext);
    } catch (e) {
        if (e instanceof HttpException) {
            expect(e.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
            expect(e.message).toBe('Too many login attempts. Please try again later.');
        } else {
            throw e;
        }
    }
  });

  it('should use req.ip if available', () => {
    mockRequest.ip = '10.0.0.1';

    // Trigger one request with this IP
    guard.canActivate(mockContext as ExecutionContext);

    // Now change IP to simulate another user
    mockRequest.ip = '10.0.0.2';

    // Fill up quota for user 2
    for(let i=0; i<5; i++) {
        expect(guard.canActivate(mockContext as ExecutionContext)).toBe(true);
    }

    // User 2 should be blocked
    expect(() => guard.canActivate(mockContext as ExecutionContext)).toThrow();

    // User 1 (10.0.0.1) should still be allowed (only 1 request used)
    mockRequest.ip = '10.0.0.1';
    expect(guard.canActivate(mockContext as ExecutionContext)).toBe(true);
  });

  it('should fallback to socket.remoteAddress if req.ip missing', () => {
      mockRequest.ip = undefined;
      mockRequest.socket.remoteAddress = '192.168.1.1';

      expect(guard.canActivate(mockContext as ExecutionContext)).toBe(true);
  });

  it('should reset count after window expires', () => {
    const realDateNow = Date.now;
    const startTime = 1000000000000;

    try {
        // Mock Date.now
        global.Date.now = jest.fn(() => startTime);

        // Use up limits
        for (let i = 0; i < 5; i++) {
            guard.canActivate(mockContext as ExecutionContext);
        }

        // Verify blocked
        expect(() => guard.canActivate(mockContext as ExecutionContext)).toThrow();

        // Fast forward 16 minutes (window is 15 mins)
        global.Date.now = jest.fn(() => startTime + 16 * 60 * 1000);

        // Should be allowed again
        expect(guard.canActivate(mockContext as ExecutionContext)).toBe(true);

    } finally {
        global.Date.now = realDateNow;
    }
  });
});
