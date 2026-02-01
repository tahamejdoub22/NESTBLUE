import { Test, TestingModule } from '@nestjs/testing';
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
  genSalt: jest.fn(),
}));
import { DashboardService } from './dashboard.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Project } from '../projects/entities/project.entity';
import { Task } from '../tasks/entities/task.entity';
import { Sprint } from '../sprints/entities/sprint.entity';
import { User } from '../users/entities/user.entity';
import { Cost } from '../costs/entities/cost.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { Budget } from '../budgets/entities/budget.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { Repository } from 'typeorm';

describe('DashboardService', () => {
  let service: DashboardService;
  let tasksRepository: Repository<Task>;
  let sprintsRepository: Repository<Sprint>;
  let projectsRepository: Repository<Project>;
  let budgetsRepository: Repository<Budget>;
  let costsRepository: Repository<Cost>;
  let expensesRepository: Repository<Expense>;

  // Mock for Tasks Service aggregation (sprints)
  const mockTaskQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };

  // Mock for Budget/Cost/Expense aggregation
  const mockAggregationQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };

  const mockTasksRepository = {
    find: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockTaskQueryBuilder),
  };

  const mockSprintsRepository = {
    find: jest.fn(),
    update: jest.fn(),
  };

  const mockProjectsRepository = {
    find: jest.fn(),
  };

  const mockRepository = {
    find: jest.fn().mockResolvedValue([]),
  };

  const mockBudgetsRepository = {
    find: jest.fn().mockResolvedValue([]),
    createQueryBuilder: jest.fn().mockReturnValue(mockAggregationQueryBuilder),
  };

  const mockCostsRepository = {
    find: jest.fn().mockResolvedValue([]),
    createQueryBuilder: jest.fn().mockReturnValue(mockAggregationQueryBuilder),
  };

  const mockExpensesRepository = {
    find: jest.fn().mockResolvedValue([]),
    createQueryBuilder: jest.fn().mockReturnValue(mockAggregationQueryBuilder),
  };

  const mockNotificationsRepository = {
    find: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    mockNotificationsRepository.find.mockResolvedValue([]);
    // Reset query builder mocks
    mockAggregationQueryBuilder.getRawMany.mockReset();
    mockTaskQueryBuilder.getRawMany.mockReset();

    // Set default returns for aggregation to avoid "undefined" errors in other tests
    mockAggregationQueryBuilder.getRawMany.mockResolvedValue([]);
    mockTaskQueryBuilder.getRawMany.mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectsRepository,
        },
        { provide: getRepositoryToken(Task), useValue: mockTasksRepository },
        {
          provide: getRepositoryToken(Sprint),
          useValue: mockSprintsRepository,
        },
        { provide: getRepositoryToken(User), useValue: mockRepository },
        { provide: getRepositoryToken(Cost), useValue: mockCostsRepository },
        {
          provide: getRepositoryToken(Expense),
          useValue: mockExpensesRepository,
        },
        {
          provide: getRepositoryToken(Budget),
          useValue: mockBudgetsRepository,
        },
        {
          provide: getRepositoryToken(Notification),
          useValue: mockNotificationsRepository,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    tasksRepository = module.get(getRepositoryToken(Task));
    sprintsRepository = module.get(getRepositoryToken(Sprint));
    projectsRepository = module.get(getRepositoryToken(Project));
    budgetsRepository = module.get(getRepositoryToken(Budget));
    costsRepository = module.get(getRepositoryToken(Cost));
    expensesRepository = module.get(getRepositoryToken(Expense));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should load task title and project name in user activity', async () => {
    // Setup data
    const notifications = [
      {
        id: 'notif-1',
        userId: 'user-1',
        type: 'task',
        message: 'Task updated',
        projectId: 'project-1',
        taskId: 'task-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { name: 'User 1', avatar: 'avatar.png' },
      },
    ];

    const projects = [{ uid: 'project-1', name: 'Project Alpha' }];
    const tasks = [{ uid: 'task-1', title: 'Task One' }];

    // Mock responses
    mockSprintsRepository.find.mockResolvedValue([]);
    mockProjectsRepository.find.mockImplementation((args) => {
      if (args && args.where && args.where.uid) {
        return Promise.resolve(projects);
      }
      return Promise.resolve([]);
    });
    mockTasksRepository.find.mockImplementation((args) => {
      if (args && args.where && args.where.uid) {
        return Promise.resolve(tasks);
      }
      return Promise.resolve([]);
    });
    mockNotificationsRepository.find.mockResolvedValue(notifications);
    // Needed for costTrend
    mockCostsRepository.find.mockResolvedValue([]);
    mockExpensesRepository.find.mockResolvedValue([]);

    const result = await service.getDashboardData('user-1');

    expect(result.userActivity).toHaveLength(1);
    expect(result.userActivity[0].projectId).toBe('project-1');
    expect(result.userActivity[0].projectName).toBe('Project Alpha');
    expect(result.userActivity[0].taskId).toBe('task-1');
    expect(result.userActivity[0].taskTitle).toBe('Task One');
  });

  it('should use createQueryBuilder for sprint counts instead of N+1 find queries', async () => {
    // Setup data
    const activeSprints = [
      { id: 'sprint-1', status: 'active', taskCount: 0, completedTaskCount: 0 },
      { id: 'sprint-2', status: 'active', taskCount: 0, completedTaskCount: 0 },
    ];

    // Mock responses
    mockSprintsRepository.find.mockResolvedValue(activeSprints);
    mockProjectsRepository.find.mockResolvedValue([]);
    mockTasksRepository.find.mockResolvedValue([]); // For allTasks

    // Mock aggregate query result
    mockTaskQueryBuilder.getRawMany.mockResolvedValue([
      { sprintId: 'sprint-1', count: '5', completedCount: '2' },
      { sprintId: 'sprint-2', count: '3', completedCount: '3' },
    ]);

    // Needed for costTrend
    mockCostsRepository.find.mockResolvedValue([]);
    mockExpensesRepository.find.mockResolvedValue([]);

    await service.getDashboardData('user-1');

    // Assertions
    // 1 call for allTasks
    expect(tasksRepository.find).toHaveBeenCalledTimes(1);

    // 1 call for createQueryBuilder (the optimization)
    expect(tasksRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
    expect(mockTaskQueryBuilder.where).toHaveBeenCalledWith(
      'task.sprintId IN (:...sprintIds)',
      { sprintIds: ['sprint-1', 'sprint-2'] },
    );

    // Ensure updates happened with correct values
    expect(sprintsRepository.update).toHaveBeenCalledWith('sprint-1', {
      taskCount: 5,
      completedTaskCount: 2,
    });
    expect(sprintsRepository.update).toHaveBeenCalledWith('sprint-2', {
      taskCount: 3,
      completedTaskCount: 3,
    });
  });

  it('should calculate project budget correctly', async () => {
    // Setup data
    const project = { uid: 'proj-1', name: 'Project 1' };

    // Order: Budgets, Costs, Expenses
    mockAggregationQueryBuilder.getRawMany
      .mockResolvedValueOnce([{ projectId: 'proj-1', total: '1000' }]) // Budget
      .mockResolvedValueOnce([{ projectId: 'proj-1', total: '200' }]) // Cost
      .mockResolvedValueOnce([{ projectId: 'proj-1', total: '50' }]); // Expense

    // Mock responses
    mockProjectsRepository.find.mockResolvedValue([project]);
    mockTasksRepository.find.mockResolvedValue([]);
    mockSprintsRepository.find.mockResolvedValue([]);

    // Mock for recent costs/expenses (costTrend)
    mockCostsRepository.find.mockResolvedValue([]);
    mockExpensesRepository.find.mockResolvedValue([]);

    const result = await service.getDashboardData('user-1');

    expect(result.projects).toHaveLength(1);
    expect(result.projects[0].budget).toEqual({
      total: 1000,
      currency: 'USD',
      spent: 250,
      remaining: 750,
    });

    expect(mockBudgetsRepository.createQueryBuilder).toHaveBeenCalled();
    expect(mockCostsRepository.createQueryBuilder).toHaveBeenCalled();
    expect(mockExpensesRepository.createQueryBuilder).toHaveBeenCalled();
  });
});
