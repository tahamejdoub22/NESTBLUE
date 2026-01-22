import { Test, TestingModule } from '@nestjs/testing';
import { SprintsService } from './sprints.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Sprint } from './entities/sprint.entity';
import { Task } from '../tasks/entities/task.entity';
import { Repository } from 'typeorm';

// Mock Repositories
const mockSprintsRepository = () => ({
  update: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

const mockTasksRepository = () => ({
  find: jest.fn(),
  count: jest.fn(),
  // Mocking createQueryBuilder to simulate the optimized query
  createQueryBuilder: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    // Simulate return value from DB: counts as strings (typical from raw queries)
    getRawOne: jest.fn().mockReturnValue({ total: '10', completed: '5' }),
  })),
});

describe('SprintsService', () => {
  let service: SprintsService;
  let sprintsRepository: Repository<Sprint>;
  let tasksRepository: Repository<Task>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SprintsService,
        {
          provide: getRepositoryToken(Sprint),
          useFactory: mockSprintsRepository,
        },
        {
          provide: getRepositoryToken(Task),
          useFactory: mockTasksRepository,
        },
      ],
    }).compile();

    service = module.get<SprintsService>(SprintsService);
    sprintsRepository = module.get(getRepositoryToken(Sprint));
    tasksRepository = module.get(getRepositoryToken(Task));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recalculateTaskCounts', () => {
    it('should update sprint with correct task counts using createQueryBuilder', async () => {
      const sprintId = 'sprint-123';

      await service.recalculateTaskCounts(sprintId);

      // Verify createQueryBuilder was used (optimization check)
      expect(tasksRepository.createQueryBuilder).toHaveBeenCalledWith('task');

      // Verify update was called with parsed numbers
      expect(sprintsRepository.update).toHaveBeenCalledWith(sprintId, {
        taskCount: 10,
        completedTaskCount: 5,
      });
    });
  });
});
