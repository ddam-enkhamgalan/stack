import * as authOps from '../db/operations/authOperations.js';
import type { User, AuthResponse, CreateUserRequest } from '../types/index.js';
import {
  comparePassword,
  generateToken,
  generateRefreshToken,
  verifyToken,
} from '../utils/auth.js';
import { isValidEmail, isValidString } from '../utils/helpers.js';

/**
 * Authentication service - handles business logic for auth operations
 */
export class AuthService {
  /**
   * Login user with email and password
   */
  static async login(email: string, password: string): Promise<AuthResponse> {
    // Validation
    if (!isValidEmail(email)) {
      throw new Error('Valid email is required');
    }

    if (!isValidString(password)) {
      throw new Error('Password is required');
    }

    // Get user with password hash
    const user = await authOps.getUserByEmailForAuth(
      email.toLowerCase().trim()
    );
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Remove password hash from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...userWithoutPassword } = user;

    // Generate tokens
    const token = generateToken(userWithoutPassword);
    const refreshToken = generateRefreshToken(userWithoutPassword);

    // Update last login (don't await - not critical)
    authOps.updateLastLogin(user.id).catch(() => {
      // Ignore errors - this is not critical
    });

    return {
      user: userWithoutPassword,
      token,
      refreshToken,
    };
  }

  /**
   * Register new user
   */
  static async register(userData: CreateUserRequest): Promise<AuthResponse> {
    // Validation
    if (!isValidString(userData.name)) {
      throw new Error('Name is required');
    }

    if (!isValidEmail(userData.email)) {
      throw new Error('Valid email is required');
    }

    if (!isValidString(userData.password)) {
      throw new Error('Password is required');
    }

    // Check if user already exists
    const existingUser = await authOps.checkUserExists(
      userData.email.toLowerCase().trim()
    );
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create user
    const newUser = await authOps.createUser({
      name: userData.name.trim(),
      email: userData.email.toLowerCase().trim(),
      password: userData.password,
    });

    // Generate tokens
    const token = generateToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    return {
      user: newUser,
      token,
      refreshToken,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(refreshTokenString: string): Promise<AuthResponse> {
    if (!isValidString(refreshTokenString)) {
      throw new Error('Refresh token is required');
    }

    try {
      // Verify refresh token
      const decoded = verifyToken(refreshTokenString);

      // Get user by ID from token
      const user = await authOps.getUserByIdForRefresh(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Remove password hash from response
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash: _, ...userWithoutPassword } = user;

      // Generate new tokens
      const newToken = generateToken(userWithoutPassword);
      const newRefreshToken = generateRefreshToken(userWithoutPassword);

      return {
        user: userWithoutPassword,
        token: newToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes('expired') ||
          error.message.includes('invalid') ||
          error.message.includes('verification failed')
        ) {
          throw new Error('Invalid or expired refresh token');
        }
      }
      throw new Error('Token refresh failed');
    }
  }

  /**
   * Validate access token and get user info
   */
  static async validateToken(tokenString: string): Promise<User | null> {
    if (!isValidString(tokenString)) {
      return null;
    }

    try {
      const decoded = verifyToken(tokenString);

      // Get user by ID (without password hash)
      const user = await authOps.getUserByIdForRefresh(decoded.userId);
      if (!user) {
        return null;
      }

      // Remove password hash from response
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash: _, ...userWithoutPassword } = user;

      return userWithoutPassword;
    } catch {
      return null;
    }
  }

  /**
   * Logout user (for future session management)
   */
  static async logout(userId: string): Promise<void> {
    // For now, just update last activity
    // In the future, we could invalidate tokens in a blacklist
    await authOps.updateLastLogin(userId);
  }
}
