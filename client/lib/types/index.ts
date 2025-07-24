/**
 * Core type definitions for the client application
 */

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  [key: string]: unknown;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
  [key: string]: unknown;
}

export interface LoginRequest {
  email: string;
  password: string;
  [key: string]: unknown;
}

export interface RefreshTokenRequest {
  refreshToken: string;
  [key: string]: unknown;
}

// Auth types
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface AuthUser extends User {
  accessToken: string;
  refreshToken: string;
  tokenExpires: number;
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
}

export interface ApiError {
  error: {
    message: string;
    status: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

export interface UserListResponse {
  users: User[];
  total: number;
  hasMore: boolean;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface UpdateProfileFormData {
  name: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

// Component props types
export interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

// Hook types
export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: CreateUserRequest) => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (userData: UpdateUserRequest) => Promise<void>;
}

// HTTP client types
export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: Record<string, unknown> | string | FormData | null;
  params?: Record<string, string | number>;
  timeout?: number;
  retries?: number;
}

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

// State types for contexts/stores
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface AppState {
  auth: AuthState;
  ui: {
    theme: 'light' | 'dark';
    sidebarOpen: boolean;
    notifications: Notification[];
  };
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}
