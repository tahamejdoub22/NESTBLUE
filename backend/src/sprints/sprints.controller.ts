import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { SprintsService } from "./sprints.service";
import { CreateSprintDto } from "./dto/create-sprint.dto";
import { UpdateSprintDto } from "./dto/update-sprint.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("Sprints")
@Controller("sprints")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SprintsController {
  constructor(private readonly sprintsService: SprintsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new sprint" })
  create(@Body() createSprintDto: CreateSprintDto) {
    return this.sprintsService.create(createSprintDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all sprints" })
  findAll(@Query("projectId") projectId?: string) {
    return this.sprintsService.findAll(projectId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get sprint by ID" })
  findOne(@Param("id") id: string) {
    return this.sprintsService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update sprint" })
  update(@Param("id") id: string, @Body() updateSprintDto: UpdateSprintDto) {
    return this.sprintsService.update(id, updateSprintDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete sprint" })
  remove(@Param("id") id: string) {
    return this.sprintsService.remove(id);
  }

  @Get(":id/tasks")
  @ApiOperation({ summary: "Get tasks by sprint" })
  async getSprintTasks(@Param("id") id: string) {
    try {
      return await this.sprintsService.getSprintTasks(id);
    } catch (error) {
      console.error(`Error in sprints.getSprintTasks for id ${id}:`, error);
      throw error;
    }
  }
}
