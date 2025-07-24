/**
 * Client library - Centralized exports for all client utilities
 */

// API layer
export * from './api';

// Services layer
export * from './services';

// Types (excluding notification types to avoid conflicts)
export type {
  ApiError,
  ApiResponse,
  AuthGuardProps,
  AuthProviderProps,
  AuthResponse,
  AuthUser,
  CreateUserRequest,
  FormErrors,
  HttpResponse,
  LoginFormData,
  LoginRequest,
  PaginatedResponse,
  RefreshTokenRequest,
  RegisterFormData,
  RequestConfig,
  UpdateProfileFormData,
  UpdateUserRequest,
  UseAuthReturn,
  User,
  UserListResponse,
  ValidationError,
} from './types';

// Constants
export * from './constants';

// Utils
export * from './utils';
