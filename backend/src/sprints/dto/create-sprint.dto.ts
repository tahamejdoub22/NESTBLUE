import { IsString, IsOptional, IsEnum, IsInt, IsDateString } from 'class-validator';
import { SprintStatus } from '../entities/sprint.entity';

export class CreateSprintDto {
  @IsString()
  name: string;

  @IsString()
  projectId: string;

  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;

  @IsOptional()
  @IsEnum(SprintStatus)
  status?: SprintStatus;

  @IsOptional()
  @IsString()
  goal?: string;

  @IsOptional()
  @IsInt()
  taskCount?: number;

  @IsOptional()
  @IsInt()
  completedTaskCount?: number;
}


