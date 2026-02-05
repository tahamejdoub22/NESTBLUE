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

  async findOne(uid: string, checkAccessForUserId?: string): Promise<Project> {
    try {
      const project = await this.projectsRepository.findOne({
        where: { uid },
        relations: ["owner", "teamSpace"],
        order: { createdAt: "DESC" },
      });

      if (!project) {
        throw new NotFoundException(`Project with UID ${uid} not found`);
      }

      if (checkAccessForUserId) {
        if (project.ownerId !== checkAccessForUserId) {
          const member = await this.projectMembersRepository.findOne({
            where: { projectUid: uid, userId: checkAccessForUserId },
          });

          if (!member) {
            throw new ForbiddenException(
              "You do not have access to this project",
            );
          }
        }
      }

      return project;
    } catch (error) {
      console.error(`Error in ProjectsService.findOne for UID ${uid}:`, error);
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
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
  async getProjectMembers(
    projectUid: string,
    checkAccessForUserId?: string,
  ): Promise<ProjectMember[]> {
    await this.findOne(projectUid, checkAccessForUserId); // Verify project exists and check access
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
    await this.validateInvitePermissions(projectUid, inviterId);

    return this.addMemberToProject(
      projectUid,
      inviteDto.userId,
      inviteDto.role || ProjectMemberRole.MEMBER,
      inviterId,
    );
  }

  async inviteMembers(
    projectUid: string,
    inviteDto: InviteMembersDto,
    inviterId: string,
  ): Promise<ProjectMember[]> {
    if (!inviteDto.userIds || inviteDto.userIds.length === 0) {
      throw new BadRequestException("At least one user ID is required");
    }

    const userIds = [...new Set(inviteDto.userIds)];
    await this.validateInvitePermissions(projectUid, inviterId);

    // Bulk fetch users to validate existence
    const users = await this.usersService.findByIds(userIds);
    const existingUserIds = users.map((u) => u.id);

    if (existingUserIds.length === 0) {
      throw new BadRequestException(
        "None of the provided users could be found",
      );
    }

    // Bulk check existing members
    const existingMembers = await this.projectMembersRepository.find({
      where: {
        projectUid,
        userId: In(existingUserIds),
      },
    });

    const existingMemberUserIds = existingMembers.map((m) => m.userId);
    const usersToInvite = existingUserIds.filter(
      (id) => !existingMemberUserIds.includes(id),
    );

    if (usersToInvite.length === 0) {
      // All valid users are already members
      return [];
    }

    const role = inviteDto.role || ProjectMemberRole.MEMBER;

    const newMembers = usersToInvite.map((userId) => {
      return this.projectMembersRepository.create({
        projectUid,
        userId,
        role,
        invitedById: inviterId,
      });
    });

    return this.projectMembersRepository.save(newMembers);
  }

  private async validateInvitePermissions(
    projectUid: string,
    inviterId: string,
  ): Promise<void> {
    const project = await this.findOne(projectUid);

    // Check if inviter is owner or admin
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
