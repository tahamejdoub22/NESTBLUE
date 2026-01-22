import { Test, TestingModule } from '@nestjs/testing';
import { SprintsService } from './sprints.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Sprint } from './entities/sprint.entity';
import { Task } from '../tasks/entities/task.entity';
import { Repository } from 'typeorm';

describe('SprintsService', () => {
  let service: SprintsService;
  let sprintsRepository: Repository<Sprint>;
  let tasksRepository: Repository<Task>;

  const mockSprintsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockTasksRepository = {
    find: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
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

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should find all sprints and return them without recalculation', async () => {
        const sprints = [
            { id: '1', startDate: new Date(), endDate: new Date() },
            { id: '2', startDate: new Date(), endDate: new Date() }
        ] as Sprint[];

        mockSprintsRepository.find.mockResolvedValue(sprints);

        const result = await service.findAll();

        expect(result).toEqual(sprints);
        // Expect only one find call
        expect(mockSprintsRepository.find).toHaveBeenCalledTimes(1);
        // And NO tasksRepository calls
        expect(mockTasksRepository.find).not.toHaveBeenCalled();
        expect(mockTasksRepository.count).not.toHaveBeenCalled();
    });
  });

  describe('recalculateTaskCounts', () => {
    it('should calculate counts using efficient queries', async () => {
        const sprintId = 'sprint-1';

        mockTasksRepository.count.mockResolvedValue(5);

        const mockQueryBuilder = {
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getCount: jest.fn().mockResolvedValue(2),
        };
        mockTasksRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

        await service.recalculateTaskCounts(sprintId);

        expect(mockTasksRepository.count).toHaveBeenCalledWith({ where: { sprintId } });
        expect(mockTasksRepository.createQueryBuilder).toHaveBeenCalledWith('task');
        expect(mockQueryBuilder.where).toHaveBeenCalledWith('task.sprintId = :sprintId', { sprintId });
        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('task.status IN (:...statuses)', { statuses: ['complete', 'COMPLETE'] });
        expect(mockSprintsRepository.update).toHaveBeenCalledWith(sprintId, {
            taskCount: 5,
            completedTaskCount: 2,
        });
    });
  });
});
