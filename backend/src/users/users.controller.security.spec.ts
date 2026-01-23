import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { UserStatus } from './entities/user.entity';

describe('UsersController Security', () => {
  let controller: UsersController;
  let usersService: Partial<UsersService>;

  beforeEach(async () => {
    usersService = {
      update: jest.fn(),
      remove: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  describe('update', () => {
    it('should allow user to update themselves', async () => {
      const userId = 'user-123';
      const req = { user: { userId, role: 'user' } };
      const dto = { name: 'New Name' };

      await controller.update(userId, dto, req);
      expect(usersService.update).toHaveBeenCalledWith(userId, dto);
    });

    it('should NOT allow user to update another user', async () => {
      const userId = 'user-123';
      const otherId = 'user-456';
      const req = { user: { userId, role: 'user' } };
      const dto = { name: 'New Name' };

      // Since the controller throws synchronously before returning promise
      expect(() => controller.update(otherId, dto, req)).toThrow(ForbiddenException);
    });

    it('should allow ADMIN to update another user', async () => {
      const userId = 'admin-123';
      const otherId = 'user-456';
      const req = { user: { userId, role: 'admin' } };
      const dto = { name: 'New Name' };

      await controller.update(otherId, dto, req);
      expect(usersService.update).toHaveBeenCalledWith(otherId, dto);
    });

    it('should remove restricted fields (role, status) when USER updates themselves', async () => {
      const userId = 'user-123';
      const req = { user: { userId, role: 'user' } };
      // Use any to bypass type check for test input construction
      const dto: any = { name: 'New Name', role: 'admin', status: UserStatus.ONLINE };

      await controller.update(userId, dto, req);

      const expectedDto = { name: 'New Name' };
      // Check that service was called with object NOT containing role/status
      const callArgs = (usersService.update as jest.Mock).mock.calls[0];
      const calledDto = callArgs[1];

      expect(calledDto.role).toBeUndefined();
      expect(calledDto.status).toBeUndefined();
      expect(calledDto.name).toBe('New Name');
    });
  });

  describe('remove', () => {
    it('should NOT allow user to remove another user', async () => {
        const userId = 'user-123';
        const otherId = 'user-456';
        const req = { user: { userId, role: 'user' } };

        expect(() => controller.remove(otherId, req)).toThrow(ForbiddenException);
    });

    it('should allow ADMIN to remove another user', async () => {
        const userId = 'admin-123';
        const otherId = 'user-456';
        const req = { user: { userId, role: 'admin' } };

        await controller.remove(otherId, req);
        expect(usersService.remove).toHaveBeenCalledWith(otherId);
    });
  });

  describe('create', () => {
     it('should NOT allow regular user to create users', async () => {
         const req = { user: { userId: '1', role: 'user' } };
         expect(() => controller.create(req, { email: 'a@a.com', password: 'p', name: 'n' })).toThrow(ForbiddenException);
     });

     it('should allow ADMIN to create users', async () => {
         const req = { user: { userId: '1', role: 'admin' } };
         const dto = { email: 'a@a.com', password: 'p', name: 'n' };
         await controller.create(req, dto);
         expect(usersService.create).toHaveBeenCalledWith(dto);
     });
  });
});
