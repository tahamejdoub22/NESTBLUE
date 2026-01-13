import { Test, TestingModule } from '@nestjs/testing';
import { SprintsService } from './sprints.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Sprint } from './entities/sprint.entity';
import { Task } from '../tasks/entities/task.entity';

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
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Task),
          useValue: {
            find: jest.fn(),
            count: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SprintsService>(SprintsService);
    sprintsRepository = module.get<Repository<Sprint>>(getRepositoryToken(Sprint));
    tasksRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recalculateTaskCounts', () => {
    it('should use count instead of find for performance', async () => {
      const sprintId = 'sprint-123';

      // Setup mock return values
      (tasksRepository.count as jest.Mock).mockImplementation((options) => {
        // If query has status condition, return completed count
        if (options && options.where && Array.isArray(options.where)) {
           return Promise.resolve(5); // Completed tasks
        }
        // Otherwise return total count
        return Promise.resolve(10);
      });

      // For the OLD implementation (before optimization), it uses .find()
      (tasksRepository.find as jest.Mock).mockResolvedValue(
          Array(10).fill({ status: 'todo' }).map((t, i) => ({
              ...t,
              status: i < 5 ? 'complete' : 'todo'
          }))
      );

      await service.recalculateTaskCounts(sprintId);

      // Verify that find was NOT called (This will fail before optimization)
      expect(tasksRepository.find).not.toHaveBeenCalled();

      // Verify that count WAS called (This will fail before optimization)
      // It might be called once or twice depending on implementation
      expect(tasksRepository.count).toHaveBeenCalled();

      expect(sprintsRepository.update).toHaveBeenCalledWith(sprintId, {
        taskCount: 10,
        completedTaskCount: 5
      });
    });
  });
});
