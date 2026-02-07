import { Test, TestingModule } from "@nestjs/testing";
// Mock bcrypt before imports
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
  genSalt: jest.fn(),
}));
import { ProjectsController } from "./projects.controller";
import { ProjectsService } from "./projects.service";
import { TasksService } from "../tasks/tasks.service";
import { TeamSpacesService } from "./team-spaces.service";

describe("ProjectsController Security", () => {
  let controller: ProjectsController;
  let projectsService: ProjectsService;

  const mockProjectsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getProjectMembers: jest.fn(),
    inviteMember: jest.fn(),
    inviteMembers: jest.fn(),
    removeMember: jest.fn(),
    updateMemberRole: jest.fn(),
  };

  const mockTasksService = {
    findAll: jest.fn(),
  };

  const mockTeamSpacesService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: mockProjectsService,
        },
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
        {
          provide: TeamSpacesService,
          useValue: mockTeamSpacesService,
        },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    projectsService = module.get<ProjectsService>(ProjectsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should verify access when finding a project (IDOR protection)", async () => {
    const projectUid = "project-123";
    const userId = "user-456";
    const req = { user: { userId } };

    mockProjectsService.findOne.mockResolvedValue({ uid: projectUid });

    // Calling findOne with request object (simulating authenticated request)
    await (controller as any).findOne(projectUid, req);

    // Assert that findOne was called with the userId for access check
    expect(projectsService.findOne).toHaveBeenCalledWith(projectUid, userId);
  });
});
