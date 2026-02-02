import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';
import { ProjectMember, ProjectMemberRole } from './entities/project-member.entity';
import { UsersService } from '../users/users.service';
import { InviteMembersDto } from './dto/invite-member.dto';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
  genSalt: jest.fn(),
}));

describe('ProjectsService', () => {
  let service: ProjectsService;
  let projectsRepository: Repository<Project>;
  let projectMembersRepository: Repository<ProjectMember>;
  let usersService: UsersService;

  const mockProject = {
    uid: 'proj-123',
    ownerId: 'user-owner',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Project;

  const mockInviterMember = {
    projectUid: 'proj-123',
    userId: 'user-owner',
    role: ProjectMemberRole.OWNER,
  } as ProjectMember;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getRepositoryToken(Project),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProjectMember),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
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
    projectsRepository = module.get<Repository<Project>>(getRepositoryToken(Project));
    projectMembersRepository = module.get<Repository<ProjectMember>>(getRepositoryToken(ProjectMember));
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('inviteMembers', () => {
    it('should use bulk operations for inviting multiple users', async () => {
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

      // Mock valid users
      jest.spyOn(usersService, 'findByIds').mockResolvedValue([
        { id: 'valid-new' },
        { id: 'valid-existing' },
      ] as any);

      // Mock existing members
      jest.spyOn(projectMembersRepository, 'find').mockResolvedValue([
        { userId: 'valid-existing' } as any
      ]);

      // Mock save
      const savedMembers = [
        { userId: 'valid-new', role: 'MEMBER' }
      ] as any;
      jest.spyOn(projectMembersRepository, 'save').mockResolvedValue(savedMembers);
      jest.spyOn(projectMembersRepository, 'create').mockImplementation((dto) => dto as any);

      const result = await service.inviteMembers(projectUid, inviteDto, inviterId);

      expect(usersService.findByIds).toHaveBeenCalled();
      // Should find existing members
      expect(projectMembersRepository.find).toHaveBeenCalled();
      // Should only save the new valid user
      expect(projectMembersRepository.save).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ userId: 'valid-new' })
      ]));
      expect(result).toHaveLength(1);
    });
  });
});
