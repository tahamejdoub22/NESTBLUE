import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { Project } from "./entities/project.entity";
import {
  ProjectMember,
  ProjectMemberRole,
} from "./entities/project-member.entity";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { InviteMemberDto, InviteMembersDto } from "./dto/invite-member.dto";
import { UsersService } from "../users/users.service";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private projectMembersRepository: Repository<ProjectMember>,
    private usersService: UsersService,
  ) {}

  async create(
    createProjectDto: CreateProjectDto,
    ownerId: string,
  ): Promise<Project> {
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
        relations: ["owner", "teamSpace"],
        order: { createdAt: "DESC" },
      });
    } catch (error) {
      console.error("Error in ProjectsService.findAll:", error);
      throw error;
    }
  }

  async findAllWithSpaces(ownerId?: string): Promise<Project[]> {
    const where = ownerId ? { ownerId } : {};
    const projects = await this.projectsRepository.find({
      where,
      relations: ["owner", "tasks"],
      order: { createdAt: "DESC" },
    });

    // For each project, check if it has team spaces
    // This is a simplified approach - in production you might want to use a join query
    return projects;
  }

  async findOne(uid: string): Promise<Project> {
    try {
      const project = await this.projectsRepository.findOne({
        where: { uid },
        relations: ["owner", "teamSpace"],
        order: { createdAt: "DESC" },
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

  async update(
    uid: string,
    updateProjectDto: UpdateProjectDto,
    userId: string,
  ): Promise<Project> {
    const project = await this.findOne(uid);

    if (project.ownerId !== userId) {
      throw new ForbiddenException(
        "You do not have permission to update this project",
      );
    }

    Object.assign(project, updateProjectDto);
    return this.projectsRepository.save(project);
  }

  async remove(uid: string, userId: string): Promise<void> {
    const project = await this.findOne(uid);

    if (project.ownerId !== userId) {
      throw new ForbiddenException(
        "You do not have permission to delete this project",
      );
    }

    await this.projectsRepository.remove(project);
  }

  // Team Members
  async getProjectMembers(projectUid: string): Promise<ProjectMember[]> {
    await this.findOne(projectUid); // Verify project exists
    return this.projectMembersRepository.find({
      where: { projectUid },
      relations: ["user", "invitedBy"],
      order: { joinedAt: "DESC" },
    });
  }

  async inviteMember(
    projectUid: string,
    inviteDto: InviteMemberDto,
    inviterId: string,
  ): Promise<ProjectMember> {
    const project = await this.findOne(projectUid);

    // Check if inviter is owner or admin
    const inviterMember = await this.projectMembersRepository.findOne({
      where: { projectUid, userId: inviterId },
    });

    if (
      project.ownerId !== inviterId &&
      (!inviterMember ||
        ![ProjectMemberRole.OWNER, ProjectMemberRole.ADMIN].includes(
          inviterMember.role,
        ))
    ) {
      throw new ForbiddenException(
        "You do not have permission to invite members",
      );
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
        throw new BadRequestException(
          `User with ID ${inviteDto.userId} not found`,
        );
      }
      throw error;
    }

    // Check if already a member
    const existing = await this.projectMembersRepository.findOne({
      where: { projectUid, userId },
    });

    if (existing) {
      throw new BadRequestException("User is already a member of this project");
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
      if (error.code === "23505") {
        // Unique constraint violation
        throw new BadRequestException(
          "User is already a member of this project",
        );
      }
      if (error.code === "23503") {
        // Foreign key constraint violation
        throw new BadRequestException("Invalid project or user reference");
      }
      throw error;
    }
  }

  async inviteMembers(
    projectUid: string,
    inviteDto: InviteMembersDto,
    inviterId: string,
  ): Promise<ProjectMember[]> {
    if (!inviteDto.userIds || inviteDto.userIds.length === 0) {
      throw new BadRequestException("At least one user ID is required");
    }

    // Deduplicate userIds
    const uniqueUserIds = [...new Set(inviteDto.userIds)];

    // 1. Fetch Project
    const project = await this.findOne(projectUid);

    // 2. Check Inviter Permissions
    if (project.ownerId !== inviterId) {
      const inviterMember = await this.projectMembersRepository.findOne({
        where: { projectUid, userId: inviterId },
      });

      if (
        !inviterMember ||
        ![ProjectMemberRole.OWNER, ProjectMemberRole.ADMIN].includes(
          inviterMember.role,
        )
      ) {
        throw new ForbiddenException(
          "You do not have permission to invite members",
        );
      }
    }

    // 3. Fetch Users (Bulk)
    const users = await this.usersService.findByIds(uniqueUserIds);
    const foundUserMap = new Map(users.map((u) => [u.id, u]));

    // 4. Check Existing Members (Bulk)
    const validUserIds = users.map((u) => u.id);
    let existingMemberIds = new Set<string>();

    if (validUserIds.length > 0) {
      const existingMembers = await this.projectMembersRepository.find({
        where: {
          projectUid,
          userId: In(validUserIds),
        },
        select: ["userId"],
      });
      existingMemberIds = new Set(existingMembers.map((m) => m.userId));
    }

    const results: ProjectMember[] = [];
    const errors: string[] = [];
    const newMembersToSave: ProjectMember[] = [];

    // 5. Process each requested user ID
    for (const userId of uniqueUserIds) {
      if (!foundUserMap.has(userId)) {
        errors.push(
          `Failed to invite user ${userId}: User with ID ${userId} not found`,
        );
        continue;
      }

      if (existingMemberIds.has(userId)) {
        continue;
      }

      const member = this.projectMembersRepository.create({
        projectUid,
        userId,
        role: inviteDto.role || ProjectMemberRole.MEMBER,
        invitedById: inviterId,
      });
      newMembersToSave.push(member);
    }

    // 6. Bulk Save
    if (newMembersToSave.length > 0) {
      const savedMembers =
        await this.projectMembersRepository.save(newMembersToSave);
      results.push(...savedMembers);
    }

    // 7. Final Check
    if (results.length === 0 && errors.length > 0) {
      throw new BadRequestException(
        `Failed to invite any members: ${errors.join("; ")}`,
      );
    }

    return results;
  }

  async removeMember(
    projectUid: string,
    userId: string,
    removerId: string,
  ): Promise<void> {
    const project = await this.findOne(projectUid);
    const member = await this.projectMembersRepository.findOne({
      where: { projectUid, userId },
    });

    if (!member) {
      throw new NotFoundException("Member not found");
    }

    // Only owner or admin can remove members, and cannot remove owner
    if (project.ownerId === userId) {
      throw new ForbiddenException("Cannot remove project owner");
    }

    const removerMember = await this.projectMembersRepository.findOne({
      where: { projectUid, userId: removerId },
    });

    if (
      project.ownerId !== removerId &&
      (!removerMember ||
        ![ProjectMemberRole.OWNER, ProjectMemberRole.ADMIN].includes(
          removerMember.role,
        ))
    ) {
      throw new ForbiddenException(
        "You do not have permission to remove members",
      );
    }

    await this.projectMembersRepository.remove(member);
  }

  async updateMemberRole(
    projectUid: string,
    userId: string,
    role: ProjectMemberRole,
    updaterId: string,
  ): Promise<ProjectMember> {
    const project = await this.findOne(projectUid);

    if (project.ownerId === userId) {
      throw new ForbiddenException("Cannot change owner role");
    }

    // Only owner can change roles
    if (project.ownerId !== updaterId) {
      throw new ForbiddenException(
        "Only project owner can change member roles",
      );
    }

    const member = await this.projectMembersRepository.findOne({
      where: { projectUid, userId },
    });

    if (!member) {
      throw new NotFoundException("Member not found");
    }

    member.role = role;
    return this.projectMembersRepository.save(member);
  }

  private generateUid(): string {
    // Generate a short alphanumeric UID (similar to frontend)
    return uuidv4().replace(/-/g, "").substring(0, 12);
  }
}
