import { Test, TestingModule } from "@nestjs/testing";
import { DashboardService } from "./dashboard.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Project } from "../projects/entities/project.entity";
import { Task } from "../tasks/entities/task.entity";
import { Comment } from "../tasks/entities/comment.entity";
import { Sprint } from "../sprints/entities/sprint.entity";
import { User } from "../users/entities/user.entity";
import { Cost } from "../costs/entities/cost.entity";
import { Expense } from "../expenses/entities/expense.entity";
import { Budget } from "../budgets/entities/budget.entity";
import { Notification } from "../notifications/entities/notification.entity";
import { Repository } from "typeorm";

// Mock bcrypt to avoid native binding errors
jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashed_password"),
  compare: jest.fn().mockResolvedValue(true),
}));

describe("DashboardService - getMonthlyProjectOverview", () => {
  let service: DashboardService;
  let tasksRepository: Repository<Task>;
  let projectsRepository: Repository<Project>;

  const mockTasksRepository = {
    find: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockProjectsRepository = {
    find: jest.fn(),
    count: jest.fn(),
  };

  const mockRepository = {
    find: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
    update: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectsRepository,
        },
        { provide: getRepositoryToken(Task), useValue: mockTasksRepository },
        { provide: getRepositoryToken(Comment), useValue: mockRepository },
        { provide: getRepositoryToken(Sprint), useValue: mockRepository },
        { provide: getRepositoryToken(User), useValue: mockRepository },
        { provide: getRepositoryToken(Cost), useValue: mockRepository },
        { provide: getRepositoryToken(Expense), useValue: mockRepository },
        { provide: getRepositoryToken(Budget), useValue: mockRepository },
        { provide: getRepositoryToken(Notification), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    tasksRepository = module.get(getRepositoryToken(Task));
    projectsRepository = module.get(getRepositoryToken(Project));

    jest.clearAllMocks();
  });

  it("should return correct overview data using in-memory aggregation", async () => {
    // Mock Projects
    mockProjectsRepository.count.mockResolvedValue(1);
    mockProjectsRepository.find.mockResolvedValue([{ uid: "p1" }]);

    // Helper to get date X months ago
    const getDate = (monthsAgo: number) => {
      const d = new Date();
      d.setMonth(d.getMonth() - monthsAgo);
      return d;
    };

    // Create tasks matching the expectations:
    // i=2 (2 months ago): Total 2, Completed 1
    // i=1 (1 month ago):  Total 2, Completed 2
    // i=0 (Current):      Total 4, Completed 2 (Note: Current month aggregates differently in code, showing ALL tasks usually?)

    // Wait, the code says:
    // Current Month: "Show ALL tasks from ALL projects"
    // Past Months: "Show tasks created or completed in that month"

    // If I want:
    // 2 months ago: 2 created
    const tasks = [
      // 2 months ago: 2 tasks created, 1 completed
      {
        uid: "t1",
        projectId: "p1",
        status: "todo",
        createdAt: getDate(2),
        updatedAt: getDate(2),
      },
      {
        uid: "t2",
        projectId: "p1",
        status: "complete",
        createdAt: getDate(2),
        updatedAt: getDate(2),
      },

      // 1 month ago: 2 tasks created, 2 completed
      {
        uid: "t3",
        projectId: "p1",
        status: "complete",
        createdAt: getDate(1),
        updatedAt: getDate(1),
      },
      {
        uid: "t4",
        projectId: "p1",
        status: "complete",
        createdAt: getDate(1),
        updatedAt: getDate(1),
      },

      // Current month: Code sums ALL tasks for current month.
      // So if I have total 4 tasks in the DB, current month should show 4.
      // And completed count: t2, t3, t4 = 3 completed.
    ];

    mockTasksRepository.find.mockResolvedValue(tasks);

    const result = await service.getMonthlyProjectOverview("user1", "month");

    // Verify find() WAS called
    expect(mockTasksRepository.find).toHaveBeenCalled();

    // Verify Array Length (last 5 months)
    expect(result).toHaveLength(5);

    const currentMonthData = result[4];
    // Current month sums ALL tasks: 4 total
    expect(currentMonthData.total).toBe(4);
    // Completed: t2, t3, t4 are complete => 3
    expect(currentMonthData.completed).toBe(3);

    const oneMonthAgoData = result[3];
    // 1 month ago: t3, t4 created
    expect(oneMonthAgoData.total).toBe(2);
    expect(oneMonthAgoData.completed).toBe(2);

    const twoMonthsAgoData = result[2];
    // 2 months ago: t1, t2 created
    expect(twoMonthsAgoData.total).toBe(2);
    expect(twoMonthsAgoData.completed).toBe(1);
  });
});
