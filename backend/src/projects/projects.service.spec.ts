import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
  genSalt: jest.fn(),
}));
import { Repository } from 'typeorm';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';
import { ProjectMember, ProjectMemberRole } from './entities/project-member.entity';
import { UsersService } from '../users/users.service';
import { InviteMembersDto } from './dto/invite-member.dto';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

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
    it('should call findOne only once for multiple users', async () => {
      const projectUid = 'proj-123';
      const inviterId = 'user-owner';
      const inviteDto: InviteMembersDto = {
        userIds: ['user-1', 'user-2'],
        role: ProjectMemberRole.MEMBER,
      };

      // Mock setup
      jest.spyOn(projectsRepository, 'findOne').mockResolvedValue(mockProject);
      jest.spyOn(projectMembersRepository, 'findOne').mockResolvedValue(null); // No existing membership for invitees
      // Mock inviter permission check (if needed, but owner check passes directly)

      // Mock user existence check
      jest.spyOn(usersService, 'findOne').mockResolvedValue({ id: 'user-x' } as any);

      // Mock save
      jest.spyOn(projectMembersRepository, 'create').mockReturnValue({} as ProjectMember);
      jest.spyOn(projectMembersRepository, 'save').mockResolvedValue({} as ProjectMember);

      await service.inviteMembers(projectUid, inviteDto, inviterId);

      // Verification
      // Currently, it calls findOne for each user + maybe internal checks?
      // With 2 users, inviteMember is called 2 times.
      // inviteMember calls findOne 1 time.
      // So total 2 calls.
      // We want to optimize it to 1 call.
      expect(projectsRepository.findOne).toHaveBeenCalledTimes(1);
    });
  });
});
