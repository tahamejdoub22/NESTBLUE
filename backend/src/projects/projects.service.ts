import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Project } from './entities/project.entity';
import { ProjectMember, ProjectMemberRole } from './entities/project-member.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InviteMemberDto, InviteMembersDto } from './dto/invite-member.dto';
import { UsersService } from '../users/users.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private projectMembersRepository: Repository<ProjectMember>,
    private usersService: UsersService,
  ) {}

  async create(createProjectDto: CreateProjectDto, ownerId: string): Promise<Project> {
    const project = this.projectsRepository.create({
      ...createProjectDto,
      uid: this.generateUid(),
      ownerId,
    });

    return this.projectsRepository.save(project);
  }

  async findAll(ownerId?: string): Promise<Project[]> {
    try {
      const where = ownerId ? { ownerId } : {};
      return await this.projectsRepository.find({
        where,
        relations: ['owner', 'teamSpace'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      console.error('Error in ProjectsService.findAll:', error);
      throw error;
    }
  }

  async findAllWithSpaces(ownerId?: string): Promise<Project[]> {
    const where = ownerId ? { ownerId } : {};
    const projects = await this.projectsRepository.find({
      where,
      relations: ['owner', 'tasks'],
      order: { createdAt: 'DESC' },
    });
    
    // For each project, check if it has team spaces
    // This is a simplified approach - in production you might want to use a join query
    return projects;
  }

  async findOne(uid: string): Promise<Project> {
    try {
      const project = await this.projectsRepository.findOne({
        where: { uid },
        relations: ['owner', 'teamSpace'],
        order: { createdAt: 'DESC' },
      });

      if (!project) {
        throw new NotFoundException(`Project with UID ${uid} not found`);
      }

      return project;
    } catch (error) {
      console.error(`Error in ProjectsService.findOne for UID ${uid}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }

  async update(uid: string, updateProjectDto: UpdateProjectDto, userId: string): Promise<Project> {
    const project = await this.findOne(uid);
    
    if (project.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to update this project');
    }

    Object.assign(project, updateProjectDto);
    return this.projectsRepository.save(project);
  }

  async remove(uid: string, userId: string): Promise<void> {
    const project = await this.findOne(uid);
    
    if (project.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this project');
    }

    await this.projectsRepository.remove(project);
  }

  // Team Members
  async getProjectMembers(projectUid: string): Promise<ProjectMember[]> {
    await this.findOne(projectUid); // Verify project exists
    return this.projectMembersRepository.find({
      where: { projectUid },
      relations: ['user', 'invitedBy'],
      order: { joinedAt: 'DESC' },
    });
  }

  async inviteMember(projectUid: string, inviteDto: InviteMemberDto, inviterId: string): Promise<ProjectMember> {
    await this.validateInvitePermissions(projectUid, inviterId);

    return this.addMemberToProject(
      projectUid,
      inviteDto.userId,
      inviteDto.role || ProjectMemberRole.MEMBER,
      inviterId,
    );
  }

  async inviteMembers(projectUid: string, inviteDto: InviteMembersDto, inviterId: string): Promise<ProjectMember[]> {
    if (!inviteDto.userIds || inviteDto.userIds.length === 0) {
      throw new BadRequestException('At least one user ID is required');
    }

    await this.validateInvitePermissions(projectUid, inviterId);

    // Performance Optimization: Batch database operations to prevent N+1 queries.
    // Reduces query count from 3N to 3 queries regardless of user count.
    const userIds = [...new Set(inviteDto.userIds)]; // Deduplicate
    const errors: string[] = [];

    // 1. Fetch valid users in bulk
    const validUsers = await this.usersService.findByIds(userIds);
    const validUserIds = new Set(validUsers.map((u) => u.id));

    // Identify invalid users
    for (const id of userIds) {
      if (!validUserIds.has(id)) {
        errors.push(`Failed to invite user ${id}: User with ID ${id} not found`);
      }
    }

    // 2. Check existing members in bulk
    const existingMembers = await this.projectMembersRepository.find({
      where: {
        projectUid,
        userId: In(Array.from(validUserIds)),
      },
      select: ['userId'],
    });

    const existingMemberIds = new Set(existingMembers.map((m) => m.userId));
    const newMembersToCreate: ProjectMember[] = [];

    for (const user of validUsers) {
      if (existingMemberIds.has(user.id)) {
        continue;
      }
      newMembersToCreate.push(
        this.projectMembersRepository.create({
          projectUid,
          userId: user.id,
          role: inviteDto.role || ProjectMemberRole.MEMBER,
          invitedById: inviterId,
        }),
      );
    }

    if (newMembersToCreate.length === 0) {
      if (errors.length > 0) {
        throw new BadRequestException(
          `Failed to invite any members: ${errors.join('; ')}`,
        );
      }
      return [];
    }

    // 3. Bulk insert new members
    // We use save which handles insertion of array
    try {
      const results = await this.projectMembersRepository.save(newMembersToCreate);
      return results;
    } catch (error: any) {
      // In case of any database error during bulk save
      throw new BadRequestException(`Failed to invite members: ${error.message}`);
    }
  }

  private async validateInvitePermissions(projectUid: string, inviterId: string): Promise<void> {
    const project = await this.findOne(projectUid);

    // If owner, always allowed
    if (project.ownerId === inviterId) {
      return;
    }

    // Check if inviter is owner or admin
    const inviterMember = await this.projectMembersRepository.findOne({
      where: { projectUid, userId: inviterId },
    });

    if (
      !inviterMember ||
      ![ProjectMemberRole.OWNER, ProjectMemberRole.ADMIN].includes(inviterMember.role)
    ) {
      throw new ForbiddenException('You do not have permission to invite members');
    }
  }

  private async addMemberToProject(
    projectUid: string,
    userId: string,
    role: ProjectMemberRole,
    inviterId: string,
  ): Promise<ProjectMember> {
    // Check if user exists
    try {
      await this.usersService.findOne(userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException(`User with ID ${userId} not found`);
      }
      throw error;
    }

    // Check if already a member
    const existing = await this.projectMembersRepository.findOne({
      where: { projectUid, userId },
    });

    if (existing) {
      throw new BadRequestException('User is already a member of this project');
    }

    const member = this.projectMembersRepository.create({
      projectUid,
      userId,
      role,
      invitedById: inviterId,
    });

    try {
      return await this.projectMembersRepository.save(member);
    } catch (error: any) {
      // Handle database constraint errors
      if (error.code === '23505') {
        // Unique constraint violation
        throw new BadRequestException('User is already a member of this project');
      }
      if (error.code === '23503') {
        // Foreign key constraint violation
        throw new BadRequestException('Invalid project or user reference');
      }
      throw error;
    }
  }

  async removeMember(projectUid: string, userId: string, removerId: string): Promise<void> {
    const project = await this.findOne(projectUid);
    const member = await this.projectMembersRepository.findOne({
      where: { projectUid, userId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Only owner or admin can remove members, and cannot remove owner
    if (project.ownerId === userId) {
      throw new ForbiddenException('Cannot remove project owner');
    }

    const removerMember = await this.projectMembersRepository.findOne({
      where: { projectUid, userId: removerId },
    });

    if (project.ownerId !== removerId && (!removerMember || ![ProjectMemberRole.OWNER, ProjectMemberRole.ADMIN].includes(removerMember.role))) {
      throw new ForbiddenException('You do not have permission to remove members');
    }

    await this.projectMembersRepository.remove(member);
  }

  async updateMemberRole(projectUid: string, userId: string, role: ProjectMemberRole, updaterId: string): Promise<ProjectMember> {
    const project = await this.findOne(projectUid);
    
    if (project.ownerId === userId) {
      throw new ForbiddenException('Cannot change owner role');
    }

    // Only owner can change roles
    if (project.ownerId !== updaterId) {
      throw new ForbiddenException('Only project owner can change member roles');
    }

    const member = await this.projectMembersRepository.findOne({
      where: { projectUid, userId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    member.role = role;
    return this.projectMembersRepository.save(member);
  }

  private generateUid(): string {
    // Generate a short alphanumeric UID (similar to frontend)
    return uuidv4().replace(/-/g, '').substring(0, 12);
  }
}


