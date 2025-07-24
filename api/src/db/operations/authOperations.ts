import type { User, UserWithPassword, CreateUserRequest } from '../../types/index.js';
import { hashPassword } from '../../utils/auth.js';
import { authQueries } from '../queries/authQueries.js';

// Database helper function
const getDbQuery = async (): Promise<
  ((text: string, params?: unknown[]) => Promise<unknown>) | null
> => {
  try {
    const { dbQuery } = await import('../../utils/database.js');
    return dbQuery;
  } catch {
    return null;
  }
};

/**
 * Get user by email for authentication (includes password hash)
 */
export const getUserByEmailForAuth = async (
  email: string
): Promise<UserWithPassword | null> => {
  const dbQuery = await getDbQuery();
  if (!dbQuery) {
    return null;
  }

  try {
    const result = (await dbQuery(authQueries.getUserForAuth, [email])) as {
      rows: {
        id: string;
        name: string;
        email: string;
        password_hash: string;
        role: string;
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
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching user by email for auth:', error);
    return null;
  }
};

/**
 * Get user by ID for token refresh (includes password hash)
 */
export const getUserByIdForRefresh = async (
  userId: string
): Promise<UserWithPassword | null> => {
  const dbQuery = await getDbQuery();
  if (!dbQuery) {
    return null;
  }

  try {
    const result = (await dbQuery(authQueries.getUserForRefresh, [userId])) as {
      rows: {
        id: string;
        name: string;
        email: string;
        password_hash: string;
        role: string;
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
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching user by ID for refresh:', error);
    return null;
  }
};

/**
 * Create new user during registration
 */
export const createUser = async (userData: CreateUserRequest): Promise<User> => {
  const dbQuery = await getDbQuery();
  if (!dbQuery) {
    throw new Error('Database not available');
  }

  try {
    const hashedPassword = await hashPassword(userData.password);

    const result = (await dbQuery(authQueries.registerUser, [
      userData.name,
      userData.email,
      hashedPassword,
    ])) as {
      rows: {
        id: string;
        name: string;
        email: string;
        role: string;
        created_at: Date;
        updated_at: Date;
      }[];
    };

    const row = result.rows[0];
    if (!row) {
      throw new Error('No user returned from database');
    }

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Check if user exists by email
 */
export const checkUserExists = async (email: string): Promise<boolean> => {
  const dbQuery = await getDbQuery();
  if (!dbQuery) {
    return false;
  }

  try {
    const result = (await dbQuery(authQueries.checkUserExists, [email])) as {
      rows: { exists: boolean }[];
    };

    return result.rows[0]?.exists ?? false;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error checking if user exists:', error);
    return false;
  }
};

/**
 * Update user's last login timestamp
 */
export const updateLastLogin = async (userId: string): Promise<void> => {
  const dbQuery = await getDbQuery();
  if (!dbQuery) {
    return;
  }

  try {
    await dbQuery(authQueries.updateLastLogin, [userId]);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error updating last login:', error);
    // Don't throw error - this is not critical
  }
};
