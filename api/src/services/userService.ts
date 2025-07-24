import * as userOps from '../db/operations/userOperations.js';
import type { User, UpdateUserRequest } from '../types/index.js';
import { hashPassword } from '../utils/auth.js';
import { isValidEmail, isValidString, isValidUuid } from '../utils/helpers.js';

/**
 * User service - handles business logic for user operations
 */
export class UserService {
  /**
   * Get all users with pagination
   */
  static async getAllUsers(
    limit = 50,
    offset = 0
  ): Promise<{
    users: User[];
    total: number;
    hasMore: boolean;
  }> {
    const [users, total] = await Promise.all([
      userOps.getAllUsers(limit, offset),
      userOps.getUserCount(),
    ]);

    return {
      users,
      total,
      hasMore: offset + users.length < total,
    };
  }

  /**
   * Get user by ID with validation
   */
  static async getUserById(id: string): Promise<User | null> {
    if (!isValidUuid(id)) {
      throw new Error('Invalid user ID format');
    }

    return userOps.getUserById(id);
  }

  /**
   * Get user by email with validation
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    if (!isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    return userOps.getUserByEmail(email.toLowerCase().trim());
  }

  /**
   * Update user with validation and business logic
   */
  static async updateUser(
    id: string,
    updateData: UpdateUserRequest,
    requestingUserId: string
  ): Promise<User | null> {
    // Validation
    if (!isValidUuid(id)) {
      throw new Error('Invalid user ID format');
    }

    // Authorization check
    if (requestingUserId !== id) {
      throw new Error('You can only update your own profile');
    }

    // Input validation
    if (updateData.name && !isValidString(updateData.name)) {
      throw new Error('Name must be a valid string');
    }

    if (updateData.email && !isValidEmail(updateData.email)) {
      throw new Error('Email must be valid');
    }

    // Check if user exists
    const existingUser = await userOps.getUserById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Prepare update data
    const userData: {
      name?: string;
      email?: string;
      passwordHash?: string;
    } = {};

    if (updateData.name) {
      userData.name = updateData.name.trim();
    }

    if (updateData.email) {
      userData.email = updateData.email.toLowerCase().trim();

      // Check if email is already taken by another user
      const existingEmailUser = await userOps.getUserByEmail(userData.email);
      if (existingEmailUser && existingEmailUser.id !== id) {
        throw new Error('Email already exists');
      }
    }

    if (updateData.password) {
      userData.passwordHash = await hashPassword(updateData.password);
    }

    return userOps.updateUser(id, userData);
  }

  /**
   * Delete user with authorization
   */
  static async deleteUser(
    id: string,
    requestingUserId: string
  ): Promise<boolean> {
    // Validation
    if (!isValidUuid(id)) {
      throw new Error('Invalid user ID format');
    }

    // Authorization check
    if (requestingUserId !== id) {
      throw new Error('You can only delete your own profile');
    }

    // Check if user exists
    const existingUser = await userOps.getUserById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    return userOps.deleteUser(id);
  }

  /**
   * Check if user can perform action (for future role-based access)
   */
  static async canUserPerformAction(
    userId: string,
    action: string,
    targetId?: string
  ): Promise<boolean> {
    const user = await userOps.getUserById(userId);
    if (!user) {
      return false;
    }

    // Admin can do everything
    if (user.role === 'admin') {
      return true;
    }

    // Users can only perform actions on their own data
    switch (action) {
      case 'update':
      case 'delete':
        return targetId === userId;
      case 'read':
        return true; // Users can read their own and others' basic info
      default:
        return false;
    }
  }
}
