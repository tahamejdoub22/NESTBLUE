// Mock bcrypt before imports to avoid native module load error
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
  genSalt: jest.fn(),
}));

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
    it('should use findByIds and bulk save for multiple users', async () => {
      const projectUid = 'proj-123';
      const inviterId = 'owner-1';
      const userIds = ['user-1', 'user-2'];
      const dto = { userIds, role: ProjectMemberRole.MEMBER };

      // Mock project existence
      (projectRepo.findOne as jest.Mock).mockResolvedValue(mockProject);

      // Mock inviter permissions (owner)
      // The service checks project.ownerId === inviterId, which is true here.

      // Mock setup
      jest.spyOn(projectsRepository, 'findOne').mockResolvedValue(mockProject);

      // Mock UsersService.findByIds
      const mockUsers = [{ id: 'user-1' }, { id: 'user-2' }];
      jest.spyOn(usersService, 'findByIds').mockResolvedValue(mockUsers as any);

      // Mock existing members check (batch)
      jest.spyOn(projectMembersRepository, 'find').mockResolvedValue([]);

      // Mock save
      const mockSavedMembers = [{ id: 'mem-1' }, { id: 'mem-2' }];
      jest.spyOn(projectMembersRepository, 'create').mockImplementation((dto) => dto as any);
      jest.spyOn(projectMembersRepository, 'save').mockResolvedValue(mockSavedMembers as any);

      await service.inviteMembers(projectUid, inviteDto, inviterId);

      expect(usersService.findByIds).toHaveBeenCalledWith(['user-1', 'user-2']);
      expect(projectMembersRepository.find).toHaveBeenCalledTimes(1); // One check for existing members
      expect(projectMembersRepository.save).toHaveBeenCalledTimes(1); // One bulk save
    });

    it('should handle partial failures (some users missing)', async () => {
      const projectUid = 'proj-123';
      const inviterId = 'user-owner';
      const inviteDto: InviteMembersDto = {
        userIds: ['user-1', 'user-missing'],
        role: ProjectMemberRole.MEMBER,
      };

      jest.spyOn(projectsRepository, 'findOne').mockResolvedValue(mockProject);

      // Mock UsersService.findByIds - only user-1 found
      const mockUsers = [{ id: 'user-1' }];
      jest.spyOn(usersService, 'findByIds').mockResolvedValue(mockUsers as any);

      jest.spyOn(projectMembersRepository, 'find').mockResolvedValue([]);

      const mockSavedMembers = [{ id: 'mem-1' }];
      jest.spyOn(projectMembersRepository, 'create').mockImplementation((dto) => dto as any);
      jest.spyOn(projectMembersRepository, 'save').mockResolvedValue(mockSavedMembers as any);

      const result = await service.inviteMembers(projectUid, inviteDto, inviterId);

      expect(result).toHaveLength(1); // Should return the successful one
      expect(usersService.findByIds).toHaveBeenCalledWith(['user-1', 'user-missing']);
    });

    it('should fail if all users missing', async () => {
       const projectUid = 'proj-123';
       const inviterId = 'user-owner';
       const inviteDto: InviteMembersDto = {
         userIds: ['user-missing'],
         role: ProjectMemberRole.MEMBER,
       };

       jest.spyOn(projectsRepository, 'findOne').mockResolvedValue(mockProject);
       jest.spyOn(usersService, 'findByIds').mockResolvedValue([]);

       await expect(service.inviteMembers(projectUid, inviteDto, inviterId))
         .rejects
         .toThrow(BadRequestException);
    });

    it('should filter out existing members', async () => {
      const projectUid = 'proj-123';
      const inviterId = 'user-owner';
      const inviteDto: InviteMembersDto = {
        userIds: ['user-1', 'user-existing'],
        role: ProjectMemberRole.MEMBER,
      };

      jest.spyOn(projectsRepository, 'findOne').mockResolvedValue(mockProject);

      const mockUsers = [{ id: 'user-1' }, { id: 'user-existing' }];
      jest.spyOn(usersService, 'findByIds').mockResolvedValue(mockUsers as any);

      // user-existing is already a member
      const existingMembers = [{ userId: 'user-existing' }];
      jest.spyOn(projectMembersRepository, 'find').mockResolvedValue(existingMembers as any);

      const mockSavedMembers = [{ id: 'mem-1' }];
      jest.spyOn(projectMembersRepository, 'create').mockImplementation((dto) => dto as any);
      jest.spyOn(projectMembersRepository, 'save').mockResolvedValue(mockSavedMembers as any);

      const result = await service.inviteMembers(projectUid, dto, inviterId);

      // Should only save user-1
      expect(projectMembersRepository.create).toHaveBeenCalledTimes(1);
      expect(projectMembersRepository.create).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user-1' }));
    });
  });
});
