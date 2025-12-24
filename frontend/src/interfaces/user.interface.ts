import { BaseEntity } from "./base.interface";

// User interface for authentication and user management
export interface User extends BaseEntity {
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  status?: "online" | "offline" | "away" | "busy";
  phone?: string;
  department?: string;
  position?: string;
}

// Authentication types
export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
  confirmPassword: string;
}

// Current user profile
export interface UserProfile extends User {
  preferences?: {
    theme?: "light" | "dark" | "system";
    language?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
  };
  settings?: {
    timezone?: string;
    dateFormat?: string;
    currency?: string;
  };
}



