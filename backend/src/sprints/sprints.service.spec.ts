import { Test, TestingModule } from '@nestjs/testing';
import { SprintsService } from './sprints.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Sprint } from './entities/sprint.entity';
import { Task, TaskStatus } from '../tasks/entities/task.entity';
import { Repository } from 'typeorm';

describe('SprintsService', () => {
  let service: SprintsService;
  let sprintsRepository: Repository<Sprint>;
  let tasksRepository: Repository<Task>;

  const mockSprint = {
    id: 'sprint-1',
    projectId: 'project-1',
    taskCount: 0,
    completedTaskCount: 0,
  } as Sprint;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SprintsService,
        {
          provide: getRepositoryToken(Sprint),
          useValue: {
            create: jest.fn().mockReturnValue(mockSprint),
            save: jest.fn().mockResolvedValue(mockSprint),
            find: jest.fn().mockResolvedValue([mockSprint]),
            findOne: jest.fn().mockResolvedValue(mockSprint),
            update: jest.fn().mockResolvedValue({ affected: 1 }),
            remove: jest.fn().mockResolvedValue({ affected: 1 }),
          },
        },
        {
          provide: getRepositoryToken(Task),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
            count: jest.fn().mockResolvedValue(0),
            createQueryBuilder: jest.fn(() => ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([]),
            })),
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
    it('should use count() queries instead of find() for performance', async () => {
      const sprintId = 'sprint-1';
      jest.spyOn(tasksRepository, 'count').mockResolvedValueOnce(10).mockResolvedValueOnce(5);

      await service.recalculateTaskCounts(sprintId);

      expect(tasksRepository.count).toHaveBeenCalledTimes(2);
      expect(tasksRepository.find).not.toHaveBeenCalled();

      expect(sprintsRepository.update).toHaveBeenCalledWith(sprintId, {
        taskCount: 10,
        completedTaskCount: 5,
      });
    });
  });

  describe('findAll', () => {
    it('should NOT recalculate task counts for every sprint (avoid N+1)', async () => {
      const sprints = [
        { ...mockSprint, id: 'sprint-1' },
        { ...mockSprint, id: 'sprint-2' },
      ] as Sprint[];

      jest.spyOn(sprintsRepository, 'find').mockResolvedValue(sprints);
      // Spy on the service method itself to check if it's called
      const recalculateSpy = jest.spyOn(service, 'recalculateTaskCounts').mockResolvedValue(undefined);

      await service.findAll('project-1');

      // Should find sprints once
      expect(sprintsRepository.find).toHaveBeenCalledTimes(1);

      // Should NOT call recalculateTaskCounts
      expect(recalculateSpy).not.toHaveBeenCalled();
    });
  });
});
