jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashed_password"),
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue("salt"),
}));

import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProjectsService } from "./projects.service";
import { Project } from "./entities/project.entity";
import {
  ProjectMember,
  ProjectMemberRole,
} from "./entities/project-member.entity";
import { UsersService } from "../users/users.service";
import { InviteMembersDto } from "./dto/invite-member.dto";
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";

describe("ProjectsService", () => {
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

  describe("inviteMembers", () => {
    it("should call findOne only once for multiple users", async () => {
      const projectUid = "proj-123";
      const inviterId = "user-owner";
      const inviteDto: InviteMembersDto = {
        userIds: ["user-1", "user-2"],
        role: ProjectMemberRole.MEMBER,
      };

      // Mock setup
      jest.spyOn(projectsRepository, "findOne").mockResolvedValue(mockProject);
      jest.spyOn(projectMembersRepository, "findOne").mockResolvedValue(null); // No existing membership for invitees
      // Mock inviter permission check (if needed, but owner check passes directly)

      // Mock user existence check
      jest
        .spyOn(usersService, "findOne")
        .mockResolvedValue({ id: "user-x" } as any);

      // Mock save
      jest
        .spyOn(projectMembersRepository, "create")
        .mockReturnValue({} as ProjectMember);
      jest
        .spyOn(projectMembersRepository, "save")
        .mockResolvedValue({} as ProjectMember);

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
