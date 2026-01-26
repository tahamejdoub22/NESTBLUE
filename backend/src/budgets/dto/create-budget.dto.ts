import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
} from "class-validator";
import { CostCategory, Currency } from "../../costs/entities/cost.entity";
import { BudgetPeriod } from "../entities/budget.entity";

export class CreateBudgetDto {
  @IsString()
  name: string;

  @IsNumber()
  amount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsEnum(CostCategory)
  category: CostCategory;

  @IsEnum(BudgetPeriod)
  period: BudgetPeriod;

  @IsDateString()
  startDate: Date;

  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @IsOptional()
  @IsString()
  projectId?: string;
}
