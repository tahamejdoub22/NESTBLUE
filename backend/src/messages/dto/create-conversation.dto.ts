import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  IsBoolean,
} from "class-validator";
import { ConversationType } from "../entities/conversation.entity";

export class CreateConversationDto {
  @IsString()
  name: string;

  @IsEnum(ConversationType)
  type: ConversationType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  participantIds?: string[];

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;

  @IsOptional()
  @IsString()
  projectUid?: string;

  @IsOptional()
  @IsString()
  spaceId?: string;
}
