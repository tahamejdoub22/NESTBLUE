import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('EmailService', () => {
  let service: EmailService;
  let configService: ConfigService;
  let sendMailMock: jest.Mock;

  beforeEach(async () => {
    sendMailMock = jest.fn().mockResolvedValue('sent');
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              if (key === 'SMTP_HOST') return 'smtp.example.com';
              if (key === 'SMTP_PORT') return 587;
              if (key === 'SMTP_USER') return 'user';
              if (key === 'SMTP_PASSWORD') return 'pass';
              if (key === 'SMTP_SECURE') return 'false';
              if (key === 'NODE_ENV') return 'test';
              if (key === 'CORS_ORIGIN') return 'http://localhost:3000';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create transporter on initialization', () => {
    expect(nodemailer.createTransport).toHaveBeenCalled();
  });

  it('should send password reset email', async () => {
    await service.sendPasswordResetEmail('test@example.com', 'token123');

    expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
      to: 'test@example.com',
      subject: 'Password Reset Request',
      html: expect.stringContaining('token=token123'),
    }));
  });

  it('should handle email sending failure', async () => {
    sendMailMock.mockRejectedValueOnce(new Error('Failed'));

    await expect(service.sendPasswordResetEmail('test@example.com', 'token123'))
      .rejects.toThrow('Failed');
  });

  it('should warn if service is not configured', async () => {
      // Override config for this test
      const warnSpy = jest.spyOn((service as any).logger, 'warn');

      // We can't easily change config injection after creation without recreating module.
      // So we test the case where we force transporter to be null/undefined if possible,
      // or create a new module.

      const module2: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(() => null), // Return null for everything
          },
        },
      ],
    }).compile();

    const service2 = module2.get<EmailService>(EmailService);
    const warnSpy2 = jest.spyOn((service2 as any).logger, 'warn');

    await service2.sendPasswordResetEmail('test@example.com', 'token');

    expect(warnSpy2).toHaveBeenCalledWith(expect.stringContaining('Email service not configured'));
  });
});
