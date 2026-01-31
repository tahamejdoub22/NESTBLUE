import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { RateLimiterGuard } from '../common/guards/rate-limiter.guard';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { Reflector } from '@nestjs/core';

// Mock bcrypt to avoid native binding errors during tests
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
  genSalt: jest.fn(),
}));

describe('AuthController Rate Limiting', () => {
  let controller: AuthController;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {},
        },
        {
          provide: UsersService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should have RateLimiterGuard on login', () => {
    const guards = reflector.get<any[]>('__guards__', controller.login);
    expect(guards).toBeDefined();
    expect(guards.some((guard) => guard === RateLimiterGuard)).toBe(true);
  });

  it('should have RateLimiterGuard on register', () => {
    const guards = reflector.get<any[]>('__guards__', controller.register);
    expect(guards).toBeDefined();
    expect(guards.some((guard) => guard === RateLimiterGuard)).toBe(true);
  });

  it('should have RateLimiterGuard on forgotPassword', () => {
    const guards = reflector.get<any[]>('__guards__', controller.forgotPassword);
    expect(guards).toBeDefined();
    expect(guards.some((guard) => guard === RateLimiterGuard)).toBe(true);
  });

  it('should have RateLimiterGuard on resetPassword', () => {
    const guards = reflector.get<any[]>('__guards__', controller.resetPassword);
    expect(guards).toBeDefined();
    expect(guards.some((guard) => guard === RateLimiterGuard)).toBe(true);
  });

  it('should have RateLimiterGuard on verifyEmail', () => {
    const guards = reflector.get<any[]>('__guards__', controller.verifyEmail);
    expect(guards).toBeDefined();
    expect(guards.some((guard) => guard === RateLimiterGuard)).toBe(true);
  });
});
