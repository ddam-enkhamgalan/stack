import { UsersApi } from '../api';
import { ERROR_MESSAGES } from '../constants';
import { UpdateUserRequest, User } from '../types';
import { AuthService } from './auth';

/**
 * User service for managing user operations
 */
export class UserService {
  /**
   * Get all users
   */
  static async getAllUsers(): Promise<User[]> {
    const currentUser = AuthService.getCurrentUser();

    if (!currentUser?.accessToken) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    try {
      const response = await UsersApi.getUsers({}, currentUser.accessToken);
      return response.users;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN);
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<User> {
    const currentUser = AuthService.getCurrentUser();

    if (!currentUser?.accessToken) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    try {
      return await UsersApi.getUserById(id, currentUser.accessToken);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN);
    }
  }

  /**
   * Update user by ID
   */
  static async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    const currentUser = AuthService.getCurrentUser();

    if (!currentUser?.accessToken) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    try {
      return await UsersApi.updateUser(id, userData, currentUser.accessToken);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN);
    }
  }

  /**
   * Delete user by ID
   */
  static async deleteUser(id: string): Promise<void> {
    const currentUser = AuthService.getCurrentUser();

    if (!currentUser?.accessToken) {
      throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
    }

    try {
      await UsersApi.deleteUser(id, currentUser.accessToken);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN);
    }
  }

  /**
   * Get current user profile
   */
  static getCurrentUserProfile(): User | null {
    const authUser = AuthService.getCurrentUser();

    if (!authUser) {
      return null;
    }

    // Convert AuthUser to User
    return {
      id: authUser.id,
      email: authUser.email,
      name: authUser.name,
      createdAt: authUser.createdAt,
      updatedAt: authUser.updatedAt,
    };
  }
}
