import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { TeamSpacesService } from './team-spaces.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InviteMemberDto, InviteMembersDto } from './dto/invite-member.dto';
import { CreateSpaceDto, UpdateSpaceDto } from './dto/create-space.dto';
import { ProjectMemberRole } from './entities/project-member.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TasksService } from '../tasks/tasks.service';

@ApiTags('Projects')
@Controller('projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly tasksService: TasksService,
    private readonly teamSpacesService: TeamSpacesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  create(@Body() createProjectDto: CreateProjectDto, @Request() req) {
    return this.projectsService.create(createProjectDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  async findAll(@Request() req) {
    try {
      if (!req.user || !req.user.userId) {
        throw new BadRequestException('User not authenticated or userId missing');
      }
      return await this.projectsService.findAll(req.user.userId);
    } catch (error) {
      console.error('Error in projects.findAll:', error);
      throw error;
    }
  }

  // Team Spaces - specific routes must come before parameterized routes
  @Get('spaces')
  @ApiOperation({ summary: 'Get all team spaces' })
  getAllSpaces(@Request() req) {
    return this.teamSpacesService.findAll(req.user.userId);
  }

  @Post('spaces')
  @ApiOperation({ summary: 'Create a new team space' })
  createSpace(@Body() createDto: CreateSpaceDto, @Request() req) {
    return this.teamSpacesService.create(createDto, req.user.userId);
  }

  @Get('spaces/:id')
  @ApiOperation({ summary: 'Get team space by ID' })
  getSpace(@Param('id') id: string, @Request() req) {
    return this.teamSpacesService.findOne(id, req.user.userId);
  }

  @Patch('spaces/:id')
  @ApiOperation({ summary: 'Update team space' })
  updateSpace(
    @Param('id') id: string,
    @Body() updateDto: UpdateSpaceDto,
    @Request() req,
  ) {
    return this.teamSpacesService.update(id, updateDto, req.user.userId);
  }

  @Delete('spaces/:id')
  @ApiOperation({ summary: 'Delete team space' })
  deleteSpace(@Param('id') id: string, @Request() req) {
    return this.teamSpacesService.remove(id, req.user.userId);
  }

  @Get(':uid')
  @ApiOperation({ summary: 'Get project by UID' })
  async findOne(@Param('uid') uid: string) {
    try {
      return await this.projectsService.findOne(uid);
    } catch (error) {
      console.error(`Error in projects.findOne for UID ${uid}:`, error);
      throw error;
    }
  }

  @Get(':uid/tasks')
  @ApiOperation({ summary: 'Get tasks by project' })
  async getTasksByProject(@Param('uid') uid: string) {
    try {
      const tasks = await this.tasksService.findAll(uid);
      return tasks.map((task) => ({
        uid: task.uid,
        identifier: task.identifier,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        projectId: task.projectId,
        assigneeIds: task.assigneeIds || [], // Include assigneeIds for frontend
        assignees: task.assigneeIds || [], // Keep assignees for backward compatibility
        dueDate: task.dueDate,
        startDate: task.startDate,
        subtasks: [],
        comments: [],
        attachments: [],
        estimatedCost: task.estimatedCost,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      }));
    } catch (error) {
      console.error(`Error in projects.getTasksByProject for UID ${uid}:`, error);
      throw error;
    }
  }

  @Patch(':uid')
  @ApiOperation({ summary: 'Update project' })
  update(
    @Param('uid') uid: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req,
  ) {
    return this.projectsService.update(uid, updateProjectDto, req.user.userId);
  }

  @Delete(':uid')
  @ApiOperation({ summary: 'Delete project' })
  remove(@Param('uid') uid: string, @Request() req) {
    return this.projectsService.remove(uid, req.user.userId);
  }

  // Team Members
  @Get(':uid/members')
  @ApiOperation({ summary: 'Get project team members' })
  getMembers(@Param('uid') uid: string) {
    return this.projectsService.getProjectMembers(uid);
  }

  @Post(':uid/members/invite')
  @ApiOperation({ summary: 'Invite a member to project' })
  inviteMember(
    @Param('uid') uid: string,
    @Body() inviteDto: InviteMemberDto,
    @Request() req,
  ) {
    return this.projectsService.inviteMember(uid, inviteDto, req.user.userId);
  }

  @Post(':uid/members/invite-multiple')
  @ApiOperation({ summary: 'Invite multiple members to project' })
  inviteMembers(
    @Param('uid') uid: string,
    @Body() inviteDto: InviteMembersDto,
    @Request() req,
  ) {
    return this.projectsService.inviteMembers(uid, inviteDto, req.user.userId);
  }

  @Delete(':uid/members/:userId')
  @ApiOperation({ summary: 'Remove member from project' })
  removeMember(
    @Param('uid') uid: string,
    @Param('userId') userId: string,
    @Request() req,
  ) {
    return this.projectsService.removeMember(uid, userId, req.user.userId);
  }

  @Patch(':uid/members/:userId/role')
  @ApiOperation({ summary: 'Update member role' })
  updateMemberRole(
    @Param('uid') uid: string,
    @Param('userId') userId: string,
    @Body('role') role: ProjectMemberRole,
    @Request() req,
  ) {
    return this.projectsService.updateMemberRole(uid, userId, role, req.user.userId);
  }

}
