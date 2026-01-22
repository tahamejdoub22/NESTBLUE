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

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>> & {
  createQueryBuilder: jest.Mock;
};

const createMockRepository = <T = any>(): MockRepository<T> => ({
  find: jest.fn().mockReturnValue(Promise.resolve([])), // Default return empty array
  findOne: jest.fn().mockReturnValue(Promise.resolve(null)),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('DashboardService', () => {
  let service: DashboardService;
  let tasksRepository: MockRepository<Task>;
  let sprintsRepository: MockRepository<Sprint>;
  let projectsRepository: MockRepository<Project>;
  let usersRepository: MockRepository<User>;
  let costsRepository: MockRepository<Cost>;
  let expensesRepository: MockRepository<Expense>;
  let budgetsRepository: MockRepository<Budget>;
  let notificationsRepository: MockRepository<Notification>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getRepositoryToken(Project), useValue: createMockRepository() },
        { provide: getRepositoryToken(Task), useValue: createMockRepository() },
        { provide: getRepositoryToken(Sprint), useValue: createMockRepository() },
        { provide: getRepositoryToken(User), useValue: createMockRepository() },
        { provide: getRepositoryToken(Cost), useValue: createMockRepository() },
        { provide: getRepositoryToken(Expense), useValue: createMockRepository() },
        { provide: getRepositoryToken(Budget), useValue: createMockRepository() },
        { provide: getRepositoryToken(Notification), useValue: createMockRepository() },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    tasksRepository = module.get(getRepositoryToken(Task));
    sprintsRepository = module.get(getRepositoryToken(Sprint));
    projectsRepository = module.get(getRepositoryToken(Project));
    usersRepository = module.get(getRepositoryToken(User));
    costsRepository = module.get(getRepositoryToken(Cost));
    expensesRepository = module.get(getRepositoryToken(Expense));
    budgetsRepository = module.get(getRepositoryToken(Budget));
    notificationsRepository = module.get(getRepositoryToken(Notification));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboardData', () => {
    it('should use createQueryBuilder for aggregation and update sprints', async () => {
      // Mock data
      const mockSprint1 = { id: 'sprint1', status: 'active', taskCount: 0, completedTaskCount: 0 } as Sprint;
      const mockSprint2 = { id: 'sprint2', status: 'active', taskCount: 0, completedTaskCount: 0 } as Sprint;
      const mockActiveSprints = [mockSprint1, mockSprint2];

      const mockTaskCounts = [
        { sprintId: 'sprint1', count: '2', completedCount: '1' },
        { sprintId: 'sprint2', count: '1', completedCount: '1' },
      ];

      // Setup specific mocks
      sprintsRepository.find.mockResolvedValue(mockActiveSprints);

      // Mock query builder chain
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockTaskCounts),
      };
      tasksRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      // Ensure other repositories return empty arrays/nulls
      projectsRepository.find.mockResolvedValue([]);
      usersRepository.find.mockResolvedValue([]);
      costsRepository.find.mockResolvedValue([]);
      expensesRepository.find.mockResolvedValue([]);
      budgetsRepository.find.mockResolvedValue([]);
      notificationsRepository.find.mockResolvedValue([]);

      await service.getDashboardData('user1');

      // Assertions
      expect(tasksRepository.createQueryBuilder).toHaveBeenCalledWith('task');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('task.sprintId IN (:...sprintIds)', { sprintIds: ['sprint1', 'sprint2'] });

      // Verify updates were called with correct counts
      expect(sprintsRepository.update).toHaveBeenCalledWith('sprint1', {
        taskCount: 2,
        completedTaskCount: 1,
      });
      expect(sprintsRepository.update).toHaveBeenCalledWith('sprint2', {
        taskCount: 1,
        completedTaskCount: 1,
      });
    });

    it('should NOT update sprints if counts are already correct', async () => {
      // Mock data
      // Initial state: counts are ALREADY correct.
      const mockSprint1 = { id: 'sprint1', status: 'active', taskCount: 2, completedTaskCount: 1 } as Sprint;
      const mockActiveSprints = [mockSprint1];

      const mockTaskCounts = [
        { sprintId: 'sprint1', count: '2', completedCount: '1' },
      ];

      // Setup specific mocks
      sprintsRepository.find.mockResolvedValue(mockActiveSprints);

      // Mock query builder chain
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockTaskCounts),
      };
      tasksRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await service.getDashboardData('user1');

      // Assertions
      expect(tasksRepository.createQueryBuilder).toHaveBeenCalled();
      // Update should NOT be called
      expect(sprintsRepository.update).not.toHaveBeenCalled();
    });
  });
});
