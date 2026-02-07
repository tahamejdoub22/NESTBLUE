import { Test, TestingModule } from "@nestjs/testing";
jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
  genSalt: jest.fn(),
}));
import { SprintsService } from "./sprints.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Sprint } from "./entities/sprint.entity";
import { Task } from "../tasks/entities/task.entity";
import { Repository } from "typeorm";

describe("SprintsService", () => {
  let service: SprintsService;
  let sprintsRepository: Repository<Sprint>;
  let tasksRepository: Repository<Task>;

  const mockSprintsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockTasksRepository = {
    find: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(5),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SprintsService,
        {
          provide: getRepositoryToken(Sprint),
          useValue: mockSprintsRepository,
        },
        {
          provide: getRepositoryToken(Task),
          useValue: mockTasksRepository,
        },
      ],
    }).compile();

    service = module.get<SprintsService>(SprintsService);
    sprintsRepository = module.get<Repository<Sprint>>(
      getRepositoryToken(Sprint),
    );
    tasksRepository = module.get<Repository<Task>>(getRepositoryToken(Task));

    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("should find all sprints WITHOUT recalculating counts (optimized behavior)", async () => {
      const mockSprints = [
        { id: "1", startDate: new Date() },
        { id: "2", startDate: new Date() },
      ];
      mockSprintsRepository.find.mockResolvedValue(mockSprints);

      await service.findAll();

      // Optimized behavior:
      // 1. find called ONCE
      // 2. recalculateTaskCounts (and thus tasksRepository calls) NEVER called

      expect(mockSprintsRepository.find).toHaveBeenCalledTimes(1);
      expect(mockTasksRepository.find).toHaveBeenCalledTimes(0);
      expect(mockTasksRepository.count).toHaveBeenCalledTimes(0); // Should not call count either in findAll
      expect(mockSprintsRepository.update).toHaveBeenCalledTimes(0);
    });
  });

  describe("findOne", () => {
    it("should find one sprint WITHOUT recalculating counts (optimized behavior)", async () => {
      const sprintId = "test-sprint";
      const mockSprint = { id: sprintId, startDate: new Date() };
      mockSprintsRepository.findOne.mockResolvedValue(mockSprint);

      await service.findOne(sprintId);

      expect(mockSprintsRepository.findOne).toHaveBeenCalledWith({
        where: { id: sprintId },
        relations: ["project"],
      });
      // Should NOT call recalculateTaskCounts (which calls tasksRepository.count and update)
      expect(mockTasksRepository.count).not.toHaveBeenCalled();
      expect(mockSprintsRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("recalculateTaskCounts", () => {
    it("should use count and createQueryBuilder instead of find", async () => {
      const sprintId = "test-sprint";
      mockTasksRepository.count.mockResolvedValue(10);

      await service.recalculateTaskCounts(sprintId);

      expect(mockTasksRepository.find).not.toHaveBeenCalled();
      expect(mockTasksRepository.count).toHaveBeenCalledWith({
        where: { sprintId },
      });
      expect(mockTasksRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockSprintsRepository.update).toHaveBeenCalledWith(sprintId, {
        taskCount: 10,
        completedTaskCount: 5, // from mocked query builder
      });
    });
  });
});
