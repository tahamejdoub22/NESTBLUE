import { RateLimiterGuard } from './rate-limiter.guard';
import { ExecutionContext, HttpStatus, HttpException } from '@nestjs/common';

describe('RateLimiterGuard', () => {
  let guard: RateLimiterGuard;
  let mockContext: Partial<ExecutionContext>;
  let mockRequest: any;

  beforeEach(() => {
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

  it('should allow first 5 requests', () => {
    const ip = '10.0.0.1';
    mockRequest.ip = ip;

    for (let i = 0; i < 5; i++) {
      expect(guard.canActivate(mockContext as ExecutionContext)).toBe(true);
    }
  });

  it('should block 6th request', () => {
    const ip = '10.0.0.2';
    mockRequest.ip = ip;

    for (let i = 0; i < 5; i++) {
      guard.canActivate(mockContext as ExecutionContext);
    }

    let caughtError: any;
    try {
      guard.canActivate(mockContext as ExecutionContext);
    } catch (e) {
      caughtError = e;
    }

    expect(caughtError).toBeInstanceOf(HttpException);
    expect(caughtError.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
    expect((caughtError.getResponse() as any).message).toBe('Too many login attempts, please try again later');
  });
});
