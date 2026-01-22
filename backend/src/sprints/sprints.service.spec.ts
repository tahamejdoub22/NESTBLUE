import { Test, TestingModule } from '@nestjs/testing';
import { SprintsService } from './sprints.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Sprint, SprintStatus } from './entities/sprint.entity';
import { Task } from '../tasks/entities/task.entity';
import { Repository } from 'typeorm';

const mockSprintsRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

const mockTasksRepository = () => ({
  find: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  })),
});

describe('SprintsService Performance', () => {
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

  it('findAll should not trigger N+1 queries', async () => {
    // Setup 10 mock sprints
    const mockSprints = Array.from({ length: 10 }, (_, i) => ({
      id: `sprint-${i}`,
      startDate: new Date(),
      endDate: new Date(),
      status: SprintStatus.ACTIVE,
    }));

    (sprintsRepository.find as jest.Mock).mockResolvedValue(mockSprints);
    (tasksRepository.count as jest.Mock).mockResolvedValue(0);

    await service.findAll('project-1');

    const taskRepoCalls = (tasksRepository.find as jest.Mock).mock.calls.length + (tasksRepository.count as jest.Mock).mock.calls.length;
    const sprintUpdateCalls = (sprintsRepository.update as jest.Mock).mock.calls.length;

    console.log(`Optimized calls - Tasks queries: ${taskRepoCalls}, Sprints.update: ${sprintUpdateCalls}`);

    expect(taskRepoCalls).toBe(0);
    expect(sprintUpdateCalls).toBe(0);
    expect(sprintsRepository.find).toHaveBeenCalledTimes(1);
  });
});
