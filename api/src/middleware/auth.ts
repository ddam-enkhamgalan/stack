import type { Response, NextFunction } from 'express';

import type { AuthenticatedRequest, User } from '../types/index.js';
import { extractTokenFromHeader, verifyToken } from '../utils/auth.js';
import { createErrorResponse } from '../utils/helpers.js';

// Database helper function
const getDbQuery = async (): Promise<
  ((text: string, params?: unknown[]) => Promise<unknown>) | null
> => {
  try {
    const { dbQuery } = await import('../utils/database.js');
    return dbQuery;
  } catch {
    return null;
  }
};

// Get user by ID from database
const getUserById = async (id: string): Promise<User | null> => {
  const dbQuery = await getDbQuery();
  if (!dbQuery) {
    return null;
  }

  try {
    const result = (await dbQuery(
      'SELECT id, name, email, created_at, updated_at FROM users WHERE id = $1',
      [id]
    )) as {
      rows: {
        id: string;
        name: string;
        email: string;
        created_at: Date;
        updated_at: Date;
      }[];
    };

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    return {
      id: row.id, // UUID strings don't need parsing
      name: row.name,
      email: row.email,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching user from database:', error);
    return null;
  }
};

/**
 * Authentication middleware that verifies JWT token
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      res.status(401).json(createErrorResponse('Authentication required', 401));
      return;
    }

    // Verify token
    const decoded = verifyToken(token);

    // Get user from database
    const user = await getUserById(decoded.userId);

    if (!user) {
      res.status(401).json(createErrorResponse('User not found', 401));
      return;
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Token verification failed';

    res.status(401).json(createErrorResponse(errorMessage, 401));
  }
};

/**
 * Optional authentication middleware that doesn't fail if no token
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const decoded = verifyToken(token);
      const user = await getUserById(decoded.userId);

      if (user) {
        req.user = user;
      }
    }

    next();
  } catch {
    // Silently fail for optional auth
    next();
  }
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (_roles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json(createErrorResponse('Authentication required', 401));
      return;
    }

    // For now, we'll just check if user exists (basic role check)
    // In a real app, you'd check user.role against the roles array
    next();
  };
};
