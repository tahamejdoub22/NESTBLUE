import { Test, TestingModule } from "@nestjs/testing";
import { ProjectsService } from "./projects.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Project } from "./entities/project.entity";
import {
  ProjectMember,
  ProjectMemberRole,
} from "./entities/project-member.entity";
import { UsersService } from "../users/users.service";
import { Repository } from "typeorm";
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { User } from "../users/entities/user.entity";

const mockProject = {
  uid: "project-123",
  ownerId: "owner-123",
  owner: { id: "owner-123" },
};

const mockUser = {
  id: "user-123",
  email: "test@example.com",
};

const mockProjectMember = {
  id: "member-123",
  projectUid: "project-123",
  userId: "user-123",
  role: ProjectMemberRole.MEMBER,
};

describe("ProjectsService", () => {
  let service: ProjectsService;
  let projectsRepository: Repository<Project>;
  let projectMembersRepository: Repository<ProjectMember>;
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
    it("should invite multiple members successfully", async () => {
      const projectUid = "project-123";
      const inviterId = "owner-123";
      const inviteDto = {
        userIds: ["user-1", "user-2"],
        role: ProjectMemberRole.MEMBER,
      };

      // Mock findOne for project
      jest
        .spyOn(projectsRepository, "findOne")
        .mockResolvedValue(mockProject as any);

      // Mock users existence
      jest.spyOn(usersService, "findOne").mockResolvedValue(mockUser as any);
      // For optimization, we will need findByIds
      jest
        .spyOn(usersService, "findByIds")
        .mockResolvedValue([
          { ...mockUser, id: "user-1" } as any,
          { ...mockUser, id: "user-2" } as any,
        ]);

      // Mock existing member check
      jest.spyOn(projectMembersRepository, "findOne").mockResolvedValue(null);
      // For optimization, we will need find
      jest.spyOn(projectMembersRepository, "find").mockResolvedValue([]);

      // Mock save
      jest
        .spyOn(projectMembersRepository, "create")
        .mockImplementation((dto) => dto as any);
      jest
        .spyOn(projectMembersRepository, "save")
        .mockImplementation(async (entity) => entity as any);

      const result = await service.inviteMembers(
        projectUid,
        inviteDto,
        inviterId,
      );

      expect(result).toHaveLength(2);
      expect(result[0].userId).toBe("user-1");
      expect(result[1].userId).toBe("user-2");
    });

    it("should return empty array if all users are already members", async () => {
      const projectUid = "project-123";
      const inviterId = "owner-123";
      const inviteDto = {
        userIds: ["user-1"],
        role: ProjectMemberRole.MEMBER,
      };

      jest
        .spyOn(projectsRepository, "findOne")
        .mockResolvedValue(mockProject as any);
      // Simulate user already member
      jest.spyOn(usersService, "findOne").mockResolvedValue(mockUser as any);
      jest
        .spyOn(projectMembersRepository, "findOne")
        .mockResolvedValue(mockProjectMember as any); // Already exists

      // For optimization path
      jest
        .spyOn(usersService, "findByIds")
        .mockResolvedValue([{ ...mockUser, id: "user-1" } as any]);
      jest
        .spyOn(projectMembersRepository, "find")
        .mockResolvedValue([{ userId: "user-1" } as any]);

      const result = await service.inviteMembers(
        projectUid,
        inviteDto,
        inviterId,
      );
      expect(result).toEqual([]);
    });
  });
});
