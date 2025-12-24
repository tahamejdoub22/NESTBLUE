import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsObject } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsObject()
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
  };

  @IsOptional()
  @IsObject()
  settings?: {
    timezone?: string;
    dateFormat?: string;
    currency?: string;
  };
}


