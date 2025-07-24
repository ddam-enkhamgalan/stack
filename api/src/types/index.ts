import type { Request } from 'express';

export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: string;
  count?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface UserWithPassword extends User {
  passwordHash: string;
  role?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export interface ErrorResponse {
  error: {
    message: string;
    status: number;
    stack?: string;
  };
}
