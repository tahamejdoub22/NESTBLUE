import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TeamSpace } from "./entities/team-space.entity";
import { ProjectMember } from "./entities/project-member.entity";
import { CreateSpaceDto, UpdateSpaceDto } from "./dto/create-space.dto";
import { ProjectsService } from "./projects.service";

@Injectable()
export class TeamSpacesService {
  constructor(
    @InjectRepository(TeamSpace)
    private spacesRepository: Repository<TeamSpace>,
    @InjectRepository(ProjectMember)
    private projectMembersRepository: Repository<ProjectMember>,
    private projectsService: ProjectsService,
  ) {}

  async create(createDto: CreateSpaceDto, userId: string): Promise<TeamSpace> {
    const space = this.spacesRepository.create({
      ...createDto,
      createdById: userId,
      memberIds: createDto.memberIds || [],
    });

    return this.spacesRepository.save(space);
  }

  async findAll(userId: string): Promise<TeamSpace[]> {
    return this.spacesRepository.find({
      where: { isActive: true },
      relations: ["createdBy", "projects"],
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: string, userId: string): Promise<TeamSpace> {
    const space = await this.spacesRepository.findOne({
      where: { id },
      relations: ["createdBy", "projects"],
    });

    if (!space) {
      throw new NotFoundException("Space not found");
    }

    return space;
  }

  async update(
    id: string,
    updateDto: UpdateSpaceDto,
    userId: string,
  ): Promise<TeamSpace> {
    const space = await this.findOne(id, userId);

    // Only creator can update
    if (space.createdById !== userId) {
      throw new ForbiddenException(
        "You do not have permission to update this space",
      );
    }

    Object.assign(space, updateDto);
    return this.spacesRepository.save(space);
  }

  async remove(id: string, userId: string): Promise<void> {
    const space = await this.findOne(id, userId);

    // Only creator can delete
    if (space.createdById !== userId) {
      throw new ForbiddenException(
        "You do not have permission to delete this space",
      );
    }

    await this.spacesRepository.remove(space);
  }
}
