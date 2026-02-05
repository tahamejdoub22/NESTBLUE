import { Test, TestingModule } from "@nestjs/testing";
import { TasksController } from "./tasks.controller";
import { TasksService } from "./tasks.service";
import { ProjectsService } from "../projects/projects.service";
import { ForbiddenException } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

// Mock bcrypt to avoid native binding errors
jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashed_password"),
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue("salt"),
}));

describe("TasksController Security", () => {
  let controller: TasksController;
  let tasksService: any;
  let projectsService: any;

  beforeEach(async () => {
    tasksService = {
      findAll: jest.fn(),
      findAllByProjectIds: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    projectsService = {
      hasAccess: jest.fn(),
      getAccessibleProjectIds: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        { provide: TasksService, useValue: tasksService },
        { provide: ProjectsService, useValue: projectsService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TasksController>(TasksController);
  });

  describe("findAll", () => {
    it("should allow access when projectId is provided and user has access", async () => {
      const req = { user: { userId: "user-1" }, query: { projectId: "proj-1" } };
      projectsService.hasAccess.mockResolvedValue(true);
      tasksService.findAll.mockResolvedValue([]);

      await controller.findAll(req);

      expect(projectsService.hasAccess).toHaveBeenCalledWith("user-1", "proj-1");
      expect(tasksService.findAll).toHaveBeenCalledWith("proj-1");
    });

    it("should deny access when projectId is provided but user lacks access", async () => {
      const req = { user: { userId: "user-1" }, query: { projectId: "proj-1" } };
      projectsService.hasAccess.mockResolvedValue(false);

      await expect(controller.findAll(req)).rejects.toThrow(ForbiddenException);
      expect(tasksService.findAll).not.toHaveBeenCalled();
    });

    it("should filter by accessible projects when projectId is NOT provided", async () => {
      const req = { user: { userId: "user-1" }, query: {} };
      projectsService.getAccessibleProjectIds.mockResolvedValue(["proj-1", "proj-2"]);
      tasksService.findAllByProjectIds.mockResolvedValue([]);

      await controller.findAll(req);

      expect(projectsService.getAccessibleProjectIds).toHaveBeenCalledWith("user-1");
      expect(tasksService.findAllByProjectIds).toHaveBeenCalledWith(["proj-1", "proj-2"]);
    });
  });

  describe("findOne", () => {
    it("should allow access if user has access to project", async () => {
      const req = { user: { userId: "user-1" } };
      const task = { uid: "task-1", projectId: "proj-1" };
      tasksService.findOne.mockResolvedValue(task);
      projectsService.hasAccess.mockResolvedValue(true);

      await controller.findOne("task-1", req);

      expect(projectsService.hasAccess).toHaveBeenCalledWith("user-1", "proj-1");
    });

    it("should deny access if user lacks access to project", async () => {
      const req = { user: { userId: "user-1" } };
      const task = { uid: "task-1", projectId: "proj-1" };
      tasksService.findOne.mockResolvedValue(task);
      projectsService.hasAccess.mockResolvedValue(false);

      await expect(controller.findOne("task-1", req)).rejects.toThrow(ForbiddenException);
    });
  });

  describe("create", () => {
    it("should allow creation if user has access to project", async () => {
      const req = { user: { userId: "user-1" } };
      const dto = { title: "New Task", projectId: "proj-1" };
      projectsService.hasAccess.mockResolvedValue(true);
      tasksService.create.mockResolvedValue({ ...dto, uid: "task-new" });

      await controller.create(dto as any, req);

      expect(projectsService.hasAccess).toHaveBeenCalledWith("user-1", "proj-1");
      expect(tasksService.create).toHaveBeenCalledWith(dto, "user-1");
    });

    it("should deny creation if user lacks access to project", async () => {
      const req = { user: { userId: "user-1" } };
      const dto = { title: "New Task", projectId: "proj-1" };
      projectsService.hasAccess.mockResolvedValue(false);

      await expect(controller.create(dto as any, req)).rejects.toThrow(ForbiddenException);
      expect(tasksService.create).not.toHaveBeenCalled();
    });
  });
});
