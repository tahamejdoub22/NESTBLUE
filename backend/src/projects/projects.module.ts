import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProjectsService } from "./projects.service";
import { TeamSpacesService } from "./team-spaces.service";
import { ProjectsController } from "./projects.controller";
import { Project } from "./entities/project.entity";
import { ProjectMember } from "./entities/project-member.entity";
import { TeamSpace } from "./entities/team-space.entity";
import { TasksModule } from "../tasks/tasks.module";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, ProjectMember, TeamSpace]),
    forwardRef(() => TasksModule),
    UsersModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, TeamSpacesService],
  exports: [ProjectsService, TeamSpacesService],
})
export class ProjectsModule {}
