import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  IsDateString,
  IsBoolean,
} from "class-validator";
import { CostCategory, Currency } from "../../costs/entities/cost.entity";
import { ContractStatus, PaymentFrequency } from "../entities/contract.entity";

export class CreateContractDto {
  @IsString()
  name: string;

  @IsString()
  contractNumber: string;

  @IsString()
  vendor: string;

  @IsOptional()
  @IsString()
  vendorEmail?: string;

  @IsOptional()
  @IsString()
  vendorPhone?: string;

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
  startDate: Date;

  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @IsOptional()
  @IsDateString()
  renewalDate?: Date;

  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;

  @IsEnum(PaymentFrequency)
  paymentFrequency: PaymentFrequency;

  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}
