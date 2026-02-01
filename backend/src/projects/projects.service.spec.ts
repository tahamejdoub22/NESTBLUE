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

jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
  genSalt: jest.fn(),
}));

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
    it("should use bulk operations for multiple users", async () => {
      const projectUid = "proj-123";
      const inviterId = "user-owner";
      const inviteDto: InviteMembersDto = {
        userIds: ["user-1", "user-2"],
        role: ProjectMemberRole.MEMBER,
      };

      // Mock setup
      jest.spyOn(projectsRepository, "findOne").mockResolvedValue(mockProject);

      // Mock users existing
      jest
        .spyOn(usersService, "findByIds")
        .mockResolvedValue([{ id: "user-1" }, { id: "user-2" }] as any);

      // Mock no existing memberships
      jest.spyOn(projectMembersRepository, "find").mockResolvedValue([]);

      // Mock save
      jest
        .spyOn(projectMembersRepository, "create")
        .mockReturnValue({} as ProjectMember);
      jest.spyOn(projectMembersRepository, "save").mockResolvedValue([] as any);

      await service.inviteMembers(projectUid, inviteDto, inviterId);

      // Verification
      expect(projectsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersService.findByIds).toHaveBeenCalledWith(["user-1", "user-2"]);
      expect(projectMembersRepository.find).toHaveBeenCalledTimes(1);
      expect(projectMembersRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});
