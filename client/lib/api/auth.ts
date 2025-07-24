/**
 * Authentication API functions
 */

import { API_ENDPOINTS } from '../constants';
import type { ApiResponse, AuthResponse, CreateUserRequest, LoginRequest, RefreshTokenRequest, User } from '../types';
import { ApiResponseHandler, httpClient } from './http-client';

export class AuthApi {
  /**
   * Login user with email and password
   */
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await httpClient.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.LOGIN, credentials);

    return ApiResponseHandler.handleResponse(response.data);
  }

  /**
   * Register new user
   */
  static async register(userData: CreateUserRequest): Promise<AuthResponse> {
    const response = await httpClient.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.REGISTER, userData);

    return ApiResponseHandler.handleResponse(response.data);
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<{ user: User; accessToken: string }> {
    const requestData: RefreshTokenRequest = { refreshToken };

    const response = await httpClient.post<ApiResponse<{ user: User; accessToken: string }>>(API_ENDPOINTS.AUTH.REFRESH, requestData);

    return ApiResponseHandler.handleResponse(response.data);
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(accessToken: string): Promise<User> {
    const response = await httpClient.get<ApiResponse<User>>(API_ENDPOINTS.AUTH.ME, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return ApiResponseHandler.handleResponse(response.data);
  }

  /**
   * Logout user (optional - for future server-side session management)
   */
  static async logout(accessToken: string): Promise<void> {
    try {
      await httpClient.post<ApiResponse<void>>(API_ENDPOINTS.AUTH.LOGOUT, null, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      // Don't throw on logout errors - just log them
      console.warn('Logout request failed:', error);
    }
  }
}
