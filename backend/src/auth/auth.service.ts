import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import * as crypto from "crypto";
import { EmailService } from "../email/email.service";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await user.validatePassword(loginDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const tokens = await this.generateTokens(user.id);

    // Update refresh token in database
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException("Email already exists");
    }

    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException("Passwords do not match");
    }

    const user = await this.usersService.create({
      name: registerDto.name,
      email: registerDto.email,
      password: registerDto.password,
    });

    const tokens = await this.generateTokens(user.id);

    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      user,
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      });

      const user = await this.usersService.findOne(payload.sub);
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      const tokens = await this.generateTokens(user.id);
      await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);
    if (!user) {
      // Don't reveal if email exists
      return {
        message: "If the email exists, a password reset link has been sent",
      };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1);

    await this.usersService.updatePasswordResetToken(
      user.id,
      resetToken,
      resetExpires,
    );

    try {
      await this.emailService.sendPasswordResetEmail(user.email, resetToken);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${user.email}`,
        error.stack,
      );
      // We don't throw the error to avoid revealing if the email exists or not
      // and to prevent enumeration attacks.
    }

    return {
      message: "If the email exists, a password reset link has been sent",
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    if (resetPasswordDto.password !== resetPasswordDto.confirmPassword) {
      throw new BadRequestException("Passwords do not match");
    }

    const user = await this.usersService.findByPasswordResetToken(
      resetPasswordDto.token,
    );
    if (!user) {
      throw new BadRequestException("Invalid or expired reset token");
    }

    if (user.passwordResetExpires < new Date()) {
      throw new BadRequestException("Reset token has expired");
    }

    await this.usersService.updatePassword(user.id, resetPasswordDto.password);
    await this.usersService.clearPasswordResetToken(user.id);

    return { message: "Password reset successfully" };
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findByEmailVerificationToken(token);
    if (!user) {
      throw new BadRequestException("Invalid verification token");
    }

    await this.usersService.verifyEmail(user.id);
    return { message: "Email verified successfully" };
  }

  private async generateTokens(userId: string) {
    const payload = { sub: userId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>("JWT_SECRET"),
        expiresIn: this.configService.get<string>("JWT_EXPIRES_IN") || "7d",
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
        expiresIn:
          this.configService.get<string>("JWT_REFRESH_EXPIRES_IN") || "30d",
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
