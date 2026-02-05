import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { NoteColor } from "../entities/note.entity";

export class CreateNoteDto {
  @ApiProperty({
    description: "Note content",
    example: "Review Q4 project proposals",
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: "Note color",
    enum: NoteColor,
    default: NoteColor.YELLOW,
  })
  @IsOptional()
  @IsEnum(NoteColor)
  color?: NoteColor;

  @ApiPropertyOptional({
    description: "Note rotation in degrees",
    example: -1.5,
    minimum: -10,
    maximum: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(-10)
  @Max(10)
  rotation?: number;
}
