import { IsString, IsNumber, IsEnum, IsOptional, IsArray, IsDateString, IsBoolean } from 'class-validator';
import { CostCategory, Currency } from '../../costs/entities/cost.entity';
import { ExpenseFrequency } from '../entities/expense.entity';

export class CreateExpenseDto {
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

  @IsEnum(ExpenseFrequency)
  frequency: ExpenseFrequency;

  @IsDateString()
  startDate: Date;

  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  projectId?: string;
}


