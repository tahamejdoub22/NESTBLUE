import { Test, TestingModule } from '@nestjs/testing';
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
  genSalt: jest.fn(),
}));
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';

describe('AuthService Security', () => {
  let service: AuthService;
  let usersService: Partial<UsersService>;
  let configService: Partial<ConfigService>;
  let emailService: Partial<EmailService>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn().mockResolvedValue({
        id: "user-id",
        email: "test@example.com",
      }),
      updatePasswordResetToken: jest.fn().mockResolvedValue(undefined),
    };

    configService = {
      get: jest.fn().mockReturnValue("production"), // Simulate production environment
    };

    emailService = {
      sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: EmailService,
          useValue: emailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it("SECURITY FIX CHECK: should NOT expose reset token in forgotPassword response", async () => {
    const result = await service.forgotPassword({ email: "test@example.com" });

    // The fix is verified if 'token' is NOT present in the result.
    expect(result).not.toHaveProperty("token");
    expect(result.message).toBe(
      "If the email exists, a password reset link has been sent",
    );
  });
});
