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
        // Allow if owner
        if (project.ownerId === checkAccessForUserId) {
          return project;
        }

        // Allow if member
        const member = await this.projectMembersRepository.findOne({
          where: { projectUid: uid, userId: checkAccessForUserId },
        });

        if (!member) {
          throw new ForbiddenException('Access denied');
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
  async getProjectMembers(projectUid: string, checkAccessForUserId?: string): Promise<ProjectMember[]> {
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

    const userIds = [...new Set(inviteDto.userIds)];
    const role = inviteDto.role || ProjectMemberRole.MEMBER;

    // Fetch all users and existing members in bulk
    const [users, existingMembers] = await Promise.all([
      this.usersService.findByIds(userIds),
      this.projectMembersRepository.find({
        where: {
          projectUid,
          userId: In(userIds),
        },
      }),
    ]);

    const foundUserIds = new Set(users.map((u) => u.id));
    const existingMemberIds = new Set(existingMembers.map((m) => m.userId));

    const newMembersData: ProjectMember[] = [];
    const errors: string[] = [];

    for (const userId of userIds) {
      if (!foundUserIds.has(userId)) {
        errors.push(`Failed to invite user ${userId}: User with ID ${userId} not found`);
        continue;
      }

      if (existingMemberIds.has(userId)) {
        continue;
      }

      newMembersData.push(
        this.projectMembersRepository.create({
          projectUid,
          userId,
          role,
          invitedById: inviterId,
        }),
      );
    }

    let results: ProjectMember[] = [];
    if (newMembersData.length > 0) {
      results = await this.projectMembersRepository.save(newMembersData);
    }

    if (results.length === 0 && errors.length > 0) {
      throw new BadRequestException(`Failed to invite any members: ${errors.join('; ')}`);
    }
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

    // Check if user exists
    let user;
    try {
      user = await this.usersService.findOne(inviteDto.userId);
    } catch (e) {
      throw new BadRequestException(
        `User with ID ${inviteDto.userId} not found`,
      );
    }

    // Check if already member
    const existing = await this.projectMembersRepository.findOne({
      where: { projectUid, userId: inviteDto.userId },
    });
    if (existing) {
      throw new BadRequestException("User is already a member of this project");
    }

    const member = this.projectMembersRepository.create({
      projectUid,
      userId: inviteDto.userId,
      role: inviteDto.role,
      invitedById: inviterId,
    });

    return this.projectMembersRepository.save(member);
  }

  async inviteMembers(
    projectUid: string,
    inviteDto: InviteMembersDto,
    inviterId: string,
  ): Promise<ProjectMember[]> {
    if (!inviteDto.userIds || inviteDto.userIds.length === 0) {
      throw new BadRequestException("At least one user ID is required");
    }

    // Verify inviter has permission
    const project = await this.findOne(projectUid);
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

    // Fetch all users to be invited
    const foundUsers = await this.usersService.findByIds(inviteDto.userIds);
    const foundUserIds = foundUsers.map((u) => u.id);
    const missingUserIds = inviteDto.userIds.filter(
      (id) => !foundUserIds.includes(id),
    );

    // Fetch existing members for these users
    let existingMemberUserIds: string[] = [];
    if (foundUserIds.length > 0) {
      const existingMembers = await this.projectMembersRepository.find({
        where: {
          projectUid,
          userId: In(foundUserIds),
        },
      });
      existingMemberUserIds = existingMembers.map((m) => m.userId);
    }

    // Determine who to invite
    const usersToInvite = foundUsers.filter(
      (u) => !existingMemberUserIds.includes(u.id),
    );

    // Bulk insert
    if (usersToInvite.length > 0) {
      const newMembers = usersToInvite.map((user) =>
        this.projectMembersRepository.create({
          projectUid,
          userId: user.id,
          role: inviteDto.role || ProjectMemberRole.MEMBER,
          invitedById: inviterId,
        }),
      );

      // Save all at once
      await this.projectMembersRepository.save(newMembers);

      return newMembers;
    }

    // If no users were successfully invited, check for errors
    const errors: string[] = [];
    if (missingUserIds.length > 0) {
      missingUserIds.forEach((id) =>
        errors.push(
          `Failed to invite user ${id}: User with ID ${id} not found`,
        ),
      );
    }

    // If no users were successfully invited and there were errors, throw
    if (errors.length > 0) {
      throw new BadRequestException(
        `Failed to invite any members: ${errors.join("; ")}`,
      );
    }

    return [];
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

  async getAccessibleProjectIds(userId: string): Promise<string[]> {
    const ownedProjects = await this.projectsRepository.find({
      where: { ownerId: userId },
      select: ["uid"],
    });

    const memberProjects = await this.projectMembersRepository.find({
      where: { userId },
      select: ["projectUid"],
    });

    const projectIds = new Set([
      ...ownedProjects.map((p) => p.uid),
      ...memberProjects.map((p) => p.projectUid),
    ]);

    return Array.from(projectIds);
  }

  async hasAccess(userId: string, projectUid: string): Promise<boolean> {
    const project = await this.projectsRepository.findOne({
      where: { uid: projectUid },
      select: ["ownerId"],
    });

    if (!project) return false;

    if (project.ownerId === userId) return true;

    const member = await this.projectMembersRepository.findOne({
      where: { projectUid, userId },
    });

    return !!member;
  }

  private generateUid(): string {
    // Generate a short alphanumeric UID (similar to frontend)
    return uuidv4().replace(/-/g, "").substring(0, 12);
  }
}
