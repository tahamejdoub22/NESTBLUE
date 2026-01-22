import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SprintsService } from './sprints.service';
import { Sprint } from './entities/sprint.entity';
import { Task } from '../tasks/entities/task.entity';

describe('SprintsService', () => {
  let service: SprintsService;
  let sprintsRepository: Repository<Sprint>;
  let tasksRepository: Repository<Task>;

  const mockSprintsQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    loadRelationCountAndMap: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const mockSprintsRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    create: jest.fn(),
    createQueryBuilder: jest.fn(() => mockSprintsQueryBuilder),
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getCount: jest.fn(),
  };

  const mockTasksRepository = {
    count: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
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
    sprintsRepository = module.get<Repository<Sprint>>(getRepositoryToken(Sprint));
    tasksRepository = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of sprints using aggregation query', async () => {
      const result = [
        { id: '1', taskCount: 5, completedTaskCount: 2 },
      ] as Sprint[];

      mockSprintsQueryBuilder.getMany.mockResolvedValue(result);

      const sprints = await service.findAll('project-1');

      expect(sprints).toEqual(result);
      expect(mockSprintsRepository.createQueryBuilder).toHaveBeenCalledWith('sprint');
      expect(mockSprintsQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('sprint.project', 'project');
      expect(mockSprintsQueryBuilder.loadRelationCountAndMap).toHaveBeenCalledTimes(2);
      expect(mockSprintsQueryBuilder.where).toHaveBeenCalledWith('sprint.projectId = :projectId', { projectId: 'project-1' });

      // Ensure recalculateTaskCounts (and thus update) is NOT called
      expect(mockSprintsRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('recalculateTaskCounts', () => {
    it('should calculate and update task counts using count queries', async () => {
      const sprintId = 'sprint-1';
      mockTasksRepository.count.mockResolvedValue(10);
      // We need to set up the mock return value on the shared mockQueryBuilder object
      mockQueryBuilder.getCount.mockResolvedValue(5);

      await service.recalculateTaskCounts(sprintId);

      expect(mockTasksRepository.count).toHaveBeenCalledWith({
        where: { sprintId },
      });
      expect(mockTasksRepository.createQueryBuilder).toHaveBeenCalledWith('task');
      expect(mockSprintsRepository.update).toHaveBeenCalledWith(sprintId, {
        taskCount: 10,
        completedTaskCount: 5,
      });
    });
  });
});
