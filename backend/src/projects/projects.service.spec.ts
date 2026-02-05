// Mock bcrypt before importing anything that uses it
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue('salt'),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';
import { ProjectMember, ProjectMemberRole } from './entities/project-member.entity';
import { UsersService } from '../users/users.service';
import { InviteMembersDto } from './dto/invite-member.dto';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

// Mock bcrypt to avoid native binding errors in tests
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue('salt'),
}));

describe('ProjectsService', () => {
  let service: ProjectsService;
  let projectRepo: Repository<Project>;
  let memberRepo: Repository<ProjectMember>;
  let usersService: UsersService;

  const mockProject = {
    uid: "proj-123",
    ownerId: "user-owner",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Project;

  const mockInviterMember = {
    projectUid: "proj-123",
    userId: "user-owner",
    role: ProjectMemberRole.OWNER,
  } as ProjectMember;

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
    projectsRepository = module.get<Repository<Project>>(
      getRepositoryToken(Project),
    );
    projectMembersRepository = module.get<Repository<ProjectMember>>(
      getRepositoryToken(ProjectMember),
    );
    usersService = module.get<UsersService>(UsersService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe('findOne with access control', () => {
    const projectUid = 'proj-123';
    const userId = 'user-123';

    it('should allow owner to access project', async () => {
      const project = { ...mockProject, ownerId: userId };
      jest.spyOn(projectsRepository, 'findOne').mockResolvedValue(project);

      const result = await service.findOne(projectUid, userId);
      expect(result).toEqual(project);
    });

    it('should allow member to access project', async () => {
      const project = { ...mockProject, ownerId: 'other-user' };
      const member = { projectUid, userId, role: ProjectMemberRole.MEMBER } as ProjectMember;

      jest.spyOn(projectsRepository, 'findOne').mockResolvedValue(project);
      jest.spyOn(projectMembersRepository, 'findOne').mockResolvedValue(member);

      const result = await service.findOne(projectUid, userId);
      expect(result).toEqual(project);
    });

    it('should deny access if not owner and not member', async () => {
      const project = { ...mockProject, ownerId: 'other-user' };

      jest.spyOn(projectsRepository, 'findOne').mockResolvedValue(project);
      jest.spyOn(projectMembersRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(projectUid, userId)).rejects.toThrow(ForbiddenException);
    });

    it('should work without access check (backward compatibility)', async () => {
      const project = { ...mockProject, ownerId: 'other-user' };
      jest.spyOn(projectsRepository, 'findOne').mockResolvedValue(project);

      const result = await service.findOne(projectUid);
      expect(result).toEqual(project);
    });
  });

  describe('inviteMembers', () => {
    it('should optimize bulk invites', async () => {
      const projectUid = 'proj-123';
      const inviterId = 'user-owner';
      const inviteDto: InviteMembersDto = {
        userIds: ['user-1', 'user-2', 'user-3'],
        role: ProjectMemberRole.MEMBER,
      };

      // Mock setup
      jest.spyOn(projectsRepository, 'findOne').mockResolvedValue(mockProject); // For permission check

      // Mock usersService.findByIds
      jest.spyOn(usersService, 'findByIds').mockResolvedValue([
        { id: 'user-1' },
        { id: 'user-2' },
        { id: 'user-3' },
      ] as any);

      // Mock finding existing members (none exist)
      jest.spyOn(projectMembersRepository, 'find').mockResolvedValue([]);

      // Mock save
      const savedMembers = [
        { userId: 'user-1', role: 'MEMBER' },
        { userId: 'user-2', role: 'MEMBER' },
        { userId: 'user-3', role: 'MEMBER' },
      ] as any;
      jest.spyOn(projectMembersRepository, 'save').mockResolvedValue(savedMembers);
      jest.spyOn(projectMembersRepository, 'create').mockImplementation((dto) => dto as any);

      const result = await service.inviteMembers(projectUid, inviteDto, inviterId);

      expect(usersService.findByIds).toHaveBeenCalledWith(expect.arrayContaining(['user-1', 'user-2', 'user-3']));
      expect(projectMembersRepository.find).toHaveBeenCalledTimes(1); // Bulk check
      expect(projectMembersRepository.save).toHaveBeenCalledTimes(1); // Bulk save
      expect(result).toHaveLength(3);
    });

    it('should handle partial invalid users and existing members', async () => {
      const projectUid = 'proj-123';
      const inviterId = 'user-owner';
      const inviteDto: InviteMembersDto = {
        userIds: ['valid-new', 'valid-existing', 'invalid'],
        role: ProjectMemberRole.MEMBER,
      };

      jest.spyOn(projectsRepository, 'findOne').mockResolvedValue(mockProject);

      // Mock existing members (return empty array = none exist)
      jest.spyOn(projectMembersRepository, 'find').mockResolvedValue([]);

      // Mock users (return all found)
      jest.spyOn(usersService, 'findByIds').mockResolvedValue([
          { id: 'user-1' } as any,
          { id: 'user-2' } as any
      ]);

      // Mock create/save
      jest.spyOn(projectMembersRepository, 'create').mockImplementation((dto) => dto as any);
      jest.spyOn(projectMembersRepository, 'save').mockResolvedValue([{}, {}] as any);

      await service.inviteMembers(projectUid, inviteDto, inviterId);

      expect(projectsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersService.findByIds).toHaveBeenCalledTimes(1);
      expect(usersService.findByIds).toHaveBeenCalledWith(['user-1', 'user-2']);
      expect(projectMembersRepository.find).toHaveBeenCalledTimes(1); // Bulk check existing
      expect(projectMembersRepository.save).toHaveBeenCalledTimes(1); // Bulk save
    });
  });

  describe('findOne with access check', () => {
    it('should allow access if user is owner', async () => {
      jest.spyOn(projectsRepository, 'findOne').mockResolvedValue(mockProject);

      const result = await service.findOne('proj-123', 'user-owner');
      expect(result).toEqual(mockProject);
    });

    it('should allow access if user is member', async () => {
      jest.spyOn(projectsRepository, 'findOne').mockResolvedValue(mockProject);
      jest.spyOn(projectMembersRepository, 'findOne').mockResolvedValue({
        projectUid: 'proj-123',
        userId: 'user-member',
        role: ProjectMemberRole.MEMBER,
      } as ProjectMember);

      const result = await service.findOne('proj-123', 'user-member');
      expect(result).toEqual(mockProject);
    });

    it('should deny access if user is not owner and not member', async () => {
      jest.spyOn(projectsRepository, 'findOne').mockResolvedValue(mockProject);
      jest.spyOn(projectMembersRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('proj-123', 'user-stranger'))
        .rejects.toThrow(ForbiddenException);
    });
  });
});
