import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { ProjectMember, ProjectMemberRole } from './entities/project-member.entity';
import { UsersService } from '../users/users.service';
import { Repository, In } from 'typeorm';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

const mockProject = {
  uid: 'proj-123',
  ownerId: 'owner-1',
};

describe('ProjectsService', () => {
  let service: ProjectsService;
  let projectRepo: Repository<Project>;
  let memberRepo: Repository<ProjectMember>;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getRepositoryToken(Project),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProjectMember),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
            findByIds: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    projectRepo = module.get<Repository<Project>>(getRepositoryToken(Project));
    memberRepo = module.get<Repository<ProjectMember>>(getRepositoryToken(ProjectMember));
    usersService = module.get<UsersService>(UsersService);
  });

  describe('inviteMembers', () => {
    it('should bulk invite members using findByIds and bulk save', async () => {
      const projectUid = 'proj-123';
      const inviterId = 'owner-1';
      const userIds = ['user-1', 'user-2'];
      const dto = { userIds, role: ProjectMemberRole.MEMBER };

      // Mock project existence
      (projectRepo.findOne as jest.Mock).mockResolvedValue(mockProject);

      // Mock inviter permissions (owner)
      // The service checks project.ownerId === inviterId, which is true here.

      // Mock users existence
      (usersService.findByIds as jest.Mock).mockResolvedValue([
        { id: 'user-1' },
        { id: 'user-2' },
      ]);

      // Mock existing members check (none exist)
      (memberRepo.find as jest.Mock).mockResolvedValue([]);

      // Mock create and save
      const member1 = { id: 'm-1', userId: 'user-1' };
      const member2 = { id: 'm-2', userId: 'user-2' };
      (memberRepo.create as jest.Mock).mockImplementation((dto) => dto);
      (memberRepo.save as jest.Mock).mockResolvedValue([member1, member2]);

      const result = await service.inviteMembers(projectUid, dto, inviterId);

      // Verification
      expect(usersService.findByIds).toHaveBeenCalledWith(userIds);
      expect(usersService.findByIds).toHaveBeenCalledTimes(1);

      // Verify memberRepo.find was called correctly with In operator
      // We can't easily check for strict equality of In(...) object, but we can check the call structure
      expect(memberRepo.find).toHaveBeenCalledTimes(1);

      expect(memberRepo.save).toHaveBeenCalledTimes(1);
      expect(memberRepo.save).toHaveBeenCalledWith(expect.arrayContaining([
          expect.objectContaining({ userId: 'user-1' }),
          expect.objectContaining({ userId: 'user-2' })
      ]));
      expect(result).toHaveLength(2);
    });

    it('should handle partial failures (missing users) gracefully', async () => {
      const projectUid = 'proj-123';
      const inviterId = 'owner-1';
      const userIds = ['user-1', 'missing-user'];
      const dto = { userIds, role: ProjectMemberRole.MEMBER };

      (projectRepo.findOne as jest.Mock).mockResolvedValue(mockProject);
      (usersService.findByIds as jest.Mock).mockResolvedValue([
        { id: 'user-1' },
      ]);
      (memberRepo.find as jest.Mock).mockResolvedValue([]);

      (memberRepo.create as jest.Mock).mockImplementation((dto) => dto);
      (memberRepo.save as jest.Mock).mockResolvedValue([{ id: 'm-1', userId: 'user-1' }]);

      // Should verify that it does NOT throw if at least one succeeds, or based on previous logic implementation
      const result = await service.inviteMembers(projectUid, dto, inviterId);

      expect(usersService.findByIds).toHaveBeenCalledWith(userIds);
      expect(memberRepo.save).toHaveBeenCalledTimes(1);
      expect(memberRepo.save).toHaveBeenCalledWith(expect.arrayContaining([
          expect.objectContaining({ userId: 'user-1' })
      ]));
      expect(result).toHaveLength(1);
    });
  });
});
