import { IsString, IsNumber, IsEnum, IsOptional, IsArray, IsDateString } from 'class-validator';
import { CostCategory, Currency } from '../entities/cost.entity';

export class CreateCostDto {
  @IsString()
  name: string;

  @IsNumber()
  amount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsEnum(CostCategory)
  category: CostCategory;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  date: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  taskId?: string;
}


