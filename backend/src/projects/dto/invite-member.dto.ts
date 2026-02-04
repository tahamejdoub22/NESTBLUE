import { IsString, IsEnum, IsArray, IsOptional } from "class-validator";
import { Transform } from "class-transformer";
import { ProjectMemberRole } from "../entities/project-member.entity";

export class InviteMemberDto {
  @IsString()
  userId: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      const lowerValue = value.toLowerCase();
      // Check if the value matches any enum value
      const enumValues = Object.values(ProjectMemberRole);
      if (enumValues.includes(lowerValue as ProjectMemberRole)) {
        return lowerValue as ProjectMemberRole;
      }
      // Try to match by enum key
      const upperValue = value.toUpperCase();
      if (upperValue in ProjectMemberRole) {
        return ProjectMemberRole[upperValue as keyof typeof ProjectMemberRole];
      }
    }
    return value;
  })
  @IsEnum(ProjectMemberRole)
  role?: ProjectMemberRole;
}

export class InviteMembersDto {
  @IsArray()
  @IsString({ each: true })
  userIds: string[];

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      const lowerValue = value.toLowerCase();
      // Check if the value matches any enum value
      const enumValues = Object.values(ProjectMemberRole);
      if (enumValues.includes(lowerValue as ProjectMemberRole)) {
        return lowerValue as ProjectMemberRole;
      }
      // Try to match by enum key
      const upperValue = value.toUpperCase();
      if (upperValue in ProjectMemberRole) {
        return ProjectMemberRole[upperValue as keyof typeof ProjectMemberRole];
      }
    }
    return value;
  })
  @IsEnum(ProjectMemberRole)
  role?: ProjectMemberRole;
}
