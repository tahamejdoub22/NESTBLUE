import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SprintsService } from './sprints.service';
import { Sprint } from './entities/sprint.entity';
import { Task } from '../tasks/entities/task.entity';
import { Repository } from 'typeorm';

const mockSprint = (id: string) => ({
  id,
  projectId: 'project-1',
  taskCount: 0,
  completedTaskCount: 0,
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
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Task),
          useValue: {
            find: jest.fn(),
            count: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              select: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              getRawMany: jest.fn().mockResolvedValue([
                { sprintId: '1', count: '10', completedCount: '5' }
              ]),
              getCount: jest.fn().mockResolvedValue(5),
            })),
          },
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

  describe('findAll', () => {
    it('should behave efficiently (optimized implementation)', async () => {
      const sprints = [mockSprint('1'), mockSprint('2')];

      (sprintsRepository.find as jest.Mock).mockResolvedValue(sprints);

      const result = await service.findAll('project-1');

      // Verify optimizations
      // 1. Fetch sprints once
      expect(sprintsRepository.find).toHaveBeenCalledTimes(1);

      // 2. No updates to DB during read
      expect(sprintsRepository.update).toHaveBeenCalledTimes(0);

      // 3. No legacy N+1 fetching
      expect(tasksRepository.find).toHaveBeenCalledTimes(0);

      // 4. One aggregation query
      expect(tasksRepository.createQueryBuilder).toHaveBeenCalledTimes(1);

      // Verify result mapping
      expect(result[0].taskCount).toBe(10);
      expect(result[0].completedTaskCount).toBe(5);
      // Sprint 2 was not in the mock counts response
      expect(result[1].taskCount).toBe(0);
    });
  });
});
