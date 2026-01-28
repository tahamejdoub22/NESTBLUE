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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByIds', () => {
    it('should return an array of users', async () => {
      const users = [new User(), new User()];
      jest.spyOn(repository, 'findBy').mockResolvedValue(users);

      const result = await service.findByIds(['1', '2']);
      expect(result).toEqual(users);
      expect(repository.findBy).toHaveBeenCalled();
    });
  });
});
