jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue('salt'),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';
import { ProjectMember } from './entities/project-member.entity';
import { UsersService } from '../users/users.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('ProjectsService Security', () => {
  let service: ProjectsService;
  let projectsRepository: Repository<Project>;
  let projectMembersRepository: Repository<ProjectMember>;

  const mockProject = {
    uid: 'proj-123',
    ownerId: 'owner-id',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Project;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getRepositoryToken(Project),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProjectMember),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    projectsRepository = module.get<Repository<Project>>(getRepositoryToken(Project));
    projectMembersRepository = module.get<Repository<ProjectMember>>(getRepositoryToken(ProjectMember));
  });

  it('should allow access if user is owner', async () => {
    jest.spyOn(projectsRepository, 'findOne').mockResolvedValue(mockProject);

    const result = await service.findOne('proj-123', 'owner-id');
    expect(result).toEqual(mockProject);
  });

  it('should allow access if user is a member', async () => {
    jest.spyOn(projectsRepository, 'findOne').mockResolvedValue(mockProject);
    jest.spyOn(projectMembersRepository, 'findOne').mockResolvedValue({ userId: 'member-id' } as ProjectMember);

    const result = await service.findOne('proj-123', 'member-id');
    expect(result).toEqual(mockProject);
    expect(projectMembersRepository.findOne).toHaveBeenCalledWith({
      where: { projectUid: 'proj-123', userId: 'member-id' },
    });
  });

  it('should deny access if user is not owner nor member', async () => {
    jest.spyOn(projectsRepository, 'findOne').mockResolvedValue(mockProject);
    jest.spyOn(projectMembersRepository, 'findOne').mockResolvedValue(null);

    await expect(service.findOne('proj-123', 'stranger-id')).rejects.toThrow(ForbiddenException);
  });

  it('should bypass check if userId is not provided (backward compatibility)', async () => {
    jest.spyOn(projectsRepository, 'findOne').mockResolvedValue(mockProject);

    const result = await service.findOne('proj-123');
    expect(result).toEqual(mockProject);
    expect(projectMembersRepository.findOne).not.toHaveBeenCalled();
  });
});
