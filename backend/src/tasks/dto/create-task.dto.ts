import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsDateString,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus, TaskPriority } from '../entities/task.entity';

class EstimatedCostDto {
  @IsOptional()
  amount?: number;

  @IsOptional()
  @IsEnum(['USD', 'EUR', 'GBP', 'MAD'])
  currency?: string;
}

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assigneeIds?: string[];

  @IsOptional()
  @IsDateString()
  dueDate?: Date;

  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => EstimatedCostDto)
  estimatedCost?: EstimatedCostDto;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  sprintId?: string;
}


