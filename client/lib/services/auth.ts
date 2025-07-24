/**
 * Authentication service - handles business logic for auth operations
 */

import { AuthApi } from '../api';
import { AUTH_CONFIG, ERROR_MESSAGES, STORAGE_KEYS } from '../constants';
import type { AuthUser, CreateUserRequest, LoginRequest, UpdateUserRequest, User } from '../types';

export class AuthService {
  /**
   * Login user and store tokens
   */
  static async login(credentials: LoginRequest): Promise<AuthUser> {
    try {
      const authResponse = await AuthApi.login(credentials);

      const authUser: AuthUser = {
        ...authResponse.user,
        accessToken: authResponse.token,
        refreshToken: authResponse.refreshToken,
        tokenExpires: Date.now() + 60 * 60 * 1000, // 1 hour from now
      };

      // Store tokens and user data
      this.storeAuthData(authUser);

      return authUser;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN);
    }
  }

  /**
   * Register new user
   */
  static async register(userData: CreateUserRequest): Promise<AuthUser> {
    try {
      const authResponse = await AuthApi.register(userData);

      const authUser: AuthUser = {
        ...authResponse.user,
        accessToken: authResponse.token,
        refreshToken: authResponse.refreshToken,
        tokenExpires: Date.now() + 60 * 60 * 1000, // 1 hour from now
      };

      // Store tokens and user data
      this.storeAuthData(authUser);

      return authUser;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN);
    }
  }

  /**
   * Logout user and clear stored data
   */
  static async logout(): Promise<void> {
    try {
      const authUser = this.getCurrentUser();

      if (authUser?.accessToken) {
        // Attempt to logout on server (optional)
        await AuthApi.logout(authUser.accessToken);
      }
    } catch (error) {
      // Don't throw on logout errors
      console.warn('Server logout failed:', error);
    } finally {
      // Always clear local storage
      this.clearAuthData();
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(): Promise<AuthUser> {
    const currentUser = this.getCurrentUser();

    if (!currentUser?.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const { user, accessToken } = await AuthApi.refreshToken(currentUser.refreshToken);

      const updatedUser: AuthUser = {
        ...user,
        accessToken,
        refreshToken: currentUser.refreshToken, // Keep existing refresh token
        tokenExpires: Date.now() + 60 * 60 * 1000, // 1 hour from now
      };

      // Update stored data
      this.storeAuthData(updatedUser);

      return updatedUser;
    } catch (error) {
      // Clear auth data on refresh failure
      console.error('Token refresh failed:', error);
      this.clearAuthData();
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }
  }

  /**
   * Update user profile
   * TODO: Implement actual profile update API call
   * @param _userData - User data to update (currently unused - placeholder implementation)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async updateProfile(_userData: UpdateUserRequest): Promise<User> {
    const currentUser = this.getCurrentUser();

    if (!currentUser?.accessToken) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    try {
      // TODO: Use userData to update profile via API
      // For now, just fetch current user data
      const updatedUser = await AuthApi.getCurrentUser(currentUser.accessToken);

      // Update stored user data
      const authUser: AuthUser = {
        ...updatedUser,
        accessToken: currentUser.accessToken,
        refreshToken: currentUser.refreshToken,
        tokenExpires: currentUser.tokenExpires,
      };

      this.storeAuthData(authUser);

      return updatedUser;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN);
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    return !!(user?.accessToken && user.tokenExpires > Date.now());
  }

  /**
   * Check if token needs refresh
   */
  static needsTokenRefresh(): boolean {
    const user = this.getCurrentUser();
    if (!user?.accessToken || !user?.refreshToken) {
      return false;
    }

    const timeUntilExpiry = user.tokenExpires - Date.now();
    return timeUntilExpiry < AUTH_CONFIG.TOKEN_REFRESH_THRESHOLD;
  }

  /**
   * Get current user from storage
   */
  static getCurrentUser(): AuthUser | null {
    if (typeof window === 'undefined') {
      return null; // SSR safety
    }

    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  /**
   * Get access token
   */
  static getAccessToken(): string | null {
    const user = this.getCurrentUser();
    return user?.accessToken || null;
  }

  /**
   * Store authentication data
   */
  private static storeAuthData(authUser: AuthUser): void {
    if (typeof window === 'undefined') {
      return; // SSR safety
    }

    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authUser));
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authUser.accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authUser.refreshToken);
    } catch (error) {
      console.error('Failed to store auth data:', error);
    }
  }

  /**
   * Clear authentication data
   */
  private static clearAuthData(): void {
    if (typeof window === 'undefined') {
      return; // SSR safety
    }

    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }

  /**
   * Initialize auth state from storage
   */
  static initialize(): AuthUser | null {
    return this.getCurrentUser();
  }
}
