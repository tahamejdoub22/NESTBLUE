import { Test, TestingModule } from '@nestjs/testing';
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
  genSalt: jest.fn(),
}));
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

describe('DashboardService - Members Population', () => {
  let service: DashboardService;
  let projectsRepositoryMock: any;

  beforeEach(async () => {
    projectsRepositoryMock = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getRepositoryToken(Project), useValue: projectsRepositoryMock },
        { provide: getRepositoryToken(Task), useValue: { find: jest.fn().mockResolvedValue([]), createQueryBuilder: jest.fn().mockReturnValue({ select: jest.fn().mockReturnThis(), addSelect: jest.fn().mockReturnThis(), where: jest.fn().mockReturnThis(), groupBy: jest.fn().mockReturnThis(), getRawMany: jest.fn().mockResolvedValue([]) }) } },
        { provide: getRepositoryToken(Sprint), useValue: { find: jest.fn().mockResolvedValue([]) } },
        { provide: getRepositoryToken(User), useValue: { find: jest.fn().mockResolvedValue([]) } },
        { provide: getRepositoryToken(Cost), useValue: { find: jest.fn().mockResolvedValue([]) } },
        { provide: getRepositoryToken(Expense), useValue: { find: jest.fn().mockResolvedValue([]) } },
        { provide: getRepositoryToken(Budget), useValue: { find: jest.fn().mockResolvedValue([]) } },
        { provide: getRepositoryToken(Notification), useValue: { find: jest.fn().mockResolvedValue([]) } },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should populate teamMemberIds from project members', async () => {
    const mockProject = {
      uid: 'p1',
      name: 'Test Project',
      members: [
        { userId: 'u1' },
        { userId: 'u2' },
      ],
      tasks: [],
    };

    projectsRepositoryMock.find.mockResolvedValue([mockProject]);

    const result = await service.getDashboardData('user1');

    expect(projectsRepositoryMock.find).toHaveBeenCalledWith(
      expect.objectContaining({
        relations: expect.arrayContaining(['members']),
      }),
    );

    const project = result.projects.find(p => p.id === 'p1');
    expect(project).toBeDefined();
    expect(project.teamMemberIds).toEqual(['u1', 'u2']);
  });

  it('should handle projects with no members', async () => {
    const mockProject = {
      uid: 'p2',
      name: 'Empty Project',
      members: [],
      tasks: [],
    };

    projectsRepositoryMock.find.mockResolvedValue([mockProject]);

    const result = await service.getDashboardData('user1');

    const project = result.projects.find(p => p.id === 'p2');
    expect(project).toBeDefined();
    expect(project.teamMemberIds).toEqual([]);
  });
});
