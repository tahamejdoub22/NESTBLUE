import { Test, TestingModule } from '@nestjs/testing';
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

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };

  const mockTasksRepository = {
    find: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
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

  const mockNotificationsRepository = {
    find: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    mockNotificationsRepository.find.mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getRepositoryToken(Project), useValue: mockProjectsRepository },
        { provide: getRepositoryToken(Task), useValue: mockTasksRepository },
        { provide: getRepositoryToken(Sprint), useValue: mockSprintsRepository },
        { provide: getRepositoryToken(User), useValue: mockRepository },
        { provide: getRepositoryToken(Cost), useValue: mockRepository },
        { provide: getRepositoryToken(Expense), useValue: mockRepository },
        { provide: getRepositoryToken(Budget), useValue: mockRepository },
        { provide: getRepositoryToken(Notification), useValue: mockNotificationsRepository },
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
    mockQueryBuilder.getRawMany.mockResolvedValue([
      { sprintId: 'sprint-1', count: '5', completedCount: '2' },
      { sprintId: 'sprint-2', count: '3', completedCount: '3' },
    ]);

    await service.getDashboardData('user-1');

    // Assertions
    // 1 call for allTasks
    expect(tasksRepository.find).toHaveBeenCalledTimes(1);

    // 1 call for createQueryBuilder (the optimization)
    expect(tasksRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
    expect(mockQueryBuilder.where).toHaveBeenCalledWith(
      'task.sprintId IN (:...sprintIds)',
      { sprintIds: ['sprint-1', 'sprint-2'] }
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
    const budgets = [{ projectId: 'proj-1', amount: 1000 }];
    const costs = [{ projectId: 'proj-1', amount: 200 }];
    const expenses = [{ projectId: 'proj-1', amount: 50 }];

    // Mock responses
    mockProjectsRepository.find.mockResolvedValue([project]);
    mockTasksRepository.find.mockResolvedValue([]);
    mockSprintsRepository.find.mockResolvedValue([]);

    // Mock budget/cost/expense repositories using the shared mockRepository
    // Since they all use mockRepository, we can just spy on the find method of each injected instance
    // Note: In the beforeEach, we assigned mockRepository to these tokens.
    // However, mockRepository.find is a shared jest.fn().
    // To mock specific return values per repository, we might need to rely on the fact that
    // NestJS testing module provides the SAME instance of mockRepository for all of them.
    // BUT, we want different returns for different calls? No, find is called once for each.
    // So we can mock the implementation of find to return different things based on what is being asked?
    // Or simpler: The DashboardService calls budgetsRepository.find, costsRepository.find, expensesRepository.find sequentially.
    // But since they are all the SAME mock object, calling mockResolvedValue on one affects all.

    // We need to distinguish them.
    // Let's check how they are provided.
    // { provide: getRepositoryToken(Budget), useValue: mockRepository },
    // They share the same object. This is a problem for mocking different responses for find().

    // However, calculateBudgetCostMetrics calls:
    // budgetsRepository.find({ relations: ['project'] })
    // costsRepository.find({ relations: ['project'] })
    // expensesRepository.find({ relations: ['project'] })

    // Since they are the same mock function, we can use mockReturnValueOnce.
    // The order of calls in calculateBudgetCostMetrics is: budgets, costs, expenses.

    // Reset the shared mock first (cleared in afterEach, but good to be sure)
    const findMock = budgetsRepository.find as jest.Mock;
    findMock.mockReset();

    // Sequence of find calls in getDashboardData:
    // 1. projectsRepository.find (mockProjectsRepository)
    // 2. tasksRepository.find (mockTasksRepository)
    // 3. sprintsRepository.find (mockSprintsRepository) - active sprints
    // 4. tasksRepository.createQueryBuilder (mockTasksRepository)
    // 5. usersRepository.find (mockRepository)
    // 6. notificationsRepository.find (mockRepository) -> getUserActivity
    // 7. budgetsRepository.find (mockRepository) -> calculateBudgetCostMetrics
    // 8. costsRepository.find (mockRepository) -> calculateBudgetCostMetrics
    // 9. expensesRepository.find (mockRepository) -> calculateBudgetCostMetrics

    // So we need to mock responses for users, notifications, budgets, costs, expenses.

    findMock
      .mockResolvedValueOnce([]) // users
      .mockResolvedValueOnce(budgets) // budgets
      .mockResolvedValueOnce(costs) // costs
      .mockResolvedValueOnce(expenses); // expenses

    const result = await service.getDashboardData('user-1');

    expect(result.projects).toHaveLength(1);
    expect(result.projects[0].budget).toEqual({
      total: 1000,
      currency: 'USD',
      spent: 250,
      remaining: 750,
    });
  });
});
