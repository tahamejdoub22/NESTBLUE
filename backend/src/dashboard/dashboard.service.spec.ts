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

  beforeEach(async () => {
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
        { provide: getRepositoryToken(Notification), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    tasksRepository = module.get(getRepositoryToken(Task));
    sprintsRepository = module.get(getRepositoryToken(Sprint));
    projectsRepository = module.get(getRepositoryToken(Project));
  });

  afterEach(() => {
    jest.clearAllMocks();
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
});
