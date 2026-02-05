import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("Users")
@Controller("users")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private isAdmin(user: any): boolean {
    return user.role === "admin";
  }

  @Post()
  @ApiOperation({ summary: "Create a new user" })
  create(@Request() req, @Body() createUserDto: CreateUserDto) {
    if (!this.isAdmin(req.user)) {
      throw new ForbiddenException("Only admins can create users");
    }
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all users" })
  findAll(@Request() req) {
    // Optional: Restrict listing all users to admins?
    // For now, let's keep it open or restrict to admins if desired.
    // The prompt highlighted "listing all users" as potential issue.
    // Let's restrict to admins for better security.
    if (!this.isAdmin(req.user)) {
      throw new ForbiddenException("Only admins can view all users");
    }
    return this.usersService.findAll();
  }

  @Get("me")
  @ApiOperation({ summary: "Get current user profile" })
  async getProfile(@Request() req) {
    return this.usersService.findOne(req.user.userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by ID" })
  findOne(@Param("id") id: string) {
    // Allowing reading single user profile might be okay for collaboration
    return this.usersService.findOne(id);
  }

  @Patch("me")
  @ApiOperation({ summary: "Update current user profile" })
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    // Sanitize input: Prevent updating sensitive fields
    delete updateUserDto.role;
    delete updateUserDto.status; // Maybe let them update status? But 'role' is critical.

    // Also prevent updating email if it requires verification (optional, but safe)

    return this.usersService.update(req.user.userId, updateUserDto);
  }

  @Post("me/password")
  @ApiOperation({ summary: "Change current user password" })
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const user = await this.usersService.findOne(req.user.userId);
    const isCurrentPasswordValid = await user.validatePassword(
      changePasswordDto.currentPassword,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException("Current password is incorrect");
    }

    await this.usersService.updatePassword(
      req.user.userId,
      changePasswordDto.newPassword,
    );
    return { message: "Password changed successfully" };
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update user" })
  update(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    const isSelf = req.user.userId === id;
    const isAdmin = this.isAdmin(req.user);

    if (!isSelf && !isAdmin) {
      throw new ForbiddenException("You can only update your own profile");
    }

    if (!isAdmin) {
      // Non-admins cannot update role or status via this endpoint either
      delete updateUserDto.role;
      delete updateUserDto.status;
    }

    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete user" })
  remove(@Param("id") id: string, @Request() req) {
    if (!this.isAdmin(req.user)) {
      throw new ForbiddenException("Only admins can delete users");
    }
    return this.usersService.remove(id);
  }
}
