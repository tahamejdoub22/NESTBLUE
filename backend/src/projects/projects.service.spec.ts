import { Test, TestingModule } from "@nestjs/testing";
import { ProjectsService } from "./projects.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Project } from "./entities/project.entity";
import {
  ProjectMember,
  ProjectMemberRole,
} from "./entities/project-member.entity";
import { UsersService } from "../users/users.service";
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";

describe("ProjectsService", () => {
  let service: ProjectsService;
  let projectsRepository;
  let projectMembersRepository;
  let usersService;

  const mockProject = {
    uid: "proj1",
    ownerId: "owner1",
  };

  const mockUser1 = { id: "user1" };
  const mockUser2 = { id: "user2" };

  beforeEach(async () => {
    projectsRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };
    projectMembersRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    usersService = {
      findOne: jest.fn(),
      findByIds: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: getRepositoryToken(Project), useValue: projectsRepository },
        {
          provide: getRepositoryToken(ProjectMember),
          useValue: projectMembersRepository,
        },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  describe("inviteMembers", () => {
    it("should successfully invite multiple users", async () => {
      const inviteDto = {
        userIds: ["user1", "user2"],
        role: ProjectMemberRole.MEMBER,
      };
      const inviterId = "owner1";

      projectsRepository.findOne.mockResolvedValue(mockProject);
      usersService.findByIds.mockResolvedValue([mockUser1, mockUser2]);

      // Existing member check returns empty array (none found)
      projectMembersRepository.find.mockResolvedValue([]);

      projectMembersRepository.create.mockImplementation((dto) => dto);
      projectMembersRepository.save.mockImplementation((members) =>
        Promise.resolve(members.map((m) => ({ ...m, id: "mem-" + m.userId }))),
      );

      const result = await service.inviteMembers("proj1", inviteDto, inviterId);

      expect(result).toHaveLength(2);
      expect(usersService.findByIds).toHaveBeenCalledWith(["user1", "user2"]);
      expect(projectMembersRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});
