import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('sanitizeUser', () => {
    it('should correctly sanitize user object using instanceToPlain', () => {
      const user = new User();
      user.id = '123';
      user.password = 'secret';
      user.refreshToken = 'token';
      user.emailVerificationToken = 'verify';
      user.passwordResetToken = 'reset';
      user.passwordResetExpires = new Date();

      const result = service.sanitizeUser(user);

      expect(result.id).toBe('123');
      expect(result.password).toBeUndefined();
      expect(result.refreshToken).toBeUndefined();
      expect(result.emailVerificationToken).toBeUndefined();
      expect(result.passwordResetToken).toBeUndefined();
      expect(result.passwordResetExpires).toBeUndefined();
    });
  });
});
