import type { User } from '../../types/index.js';
import { userQueries } from '../queries/userQueries.js';

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

// Mock data (fallback when database is not available)
const mockUsers: User[] = [
  {
    id: '00000000-0000-4000-0000-000000000001',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '00000000-0000-4000-0000-000000000002',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * Get all users from database with pagination
 */
export const getAllUsers = async (
  limit = 50,
  offset = 0
): Promise<User[]> => {
  const dbQuery = await getDbQuery();
  if (!dbQuery) {
    return mockUsers.slice(offset, offset + limit);
  }

  try {
    const result = (await dbQuery(userQueries.getAllUsers, [limit, offset])) as {
      rows: {
        id: string;
        name: string;
        email: string;
        role: string;
        created_at: Date;
        updated_at: Date;
      }[];
    };

    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching users from database:', error);
    return mockUsers.slice(offset, offset + limit);
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (id: string): Promise<User | null> => {
  const dbQuery = await getDbQuery();
  if (!dbQuery) {
    return mockUsers.find(u => u.id === id) ?? null;
  }

  try {
    const result = (await dbQuery(userQueries.getUserById, [id])) as {
      rows: {
        id: string;
        name: string;
        email: string;
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
      role: row.role,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching user from database:', error);
    return mockUsers.find(u => u.id === id) ?? null;
  }
};

/**
 * Get user by email (safe - no password hash)
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
  const dbQuery = await getDbQuery();
  if (!dbQuery) {
    return mockUsers.find(u => u.email === email.toLowerCase()) ?? null;
  }

  try {
    const result = (await dbQuery(userQueries.getUserByEmailSafe, [email])) as {
      rows: {
        id: string;
        name: string;
        email: string;
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
      role: row.role,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching user by email:', error);
    return mockUsers.find(u => u.email === email.toLowerCase()) ?? null;
  }
};

/**
 * Update user by ID
 */
export const updateUser = async (
  id: string,
  userData: {
    name?: string;
    email?: string;
    passwordHash?: string;
  }
): Promise<User | null> => {
  const dbQuery = await getDbQuery();
  if (!dbQuery) {
    // Mock update for fallback
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) return null;
    
    const user = mockUsers[userIndex];
    if (!user) return null;
    
    const updatedUser = {
      ...user,
      name: userData.name ?? user.name,
      email: userData.email ?? user.email,
      updatedAt: new Date(),
    };
    
    mockUsers[userIndex] = updatedUser;
    return updatedUser;
  }

  try {
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (userData.name) {
      updates.push(`name = $${paramIndex}`);
      values.push(userData.name);
      paramIndex++;
    }

    if (userData.email) {
      updates.push(`email = $${paramIndex}`);
      values.push(userData.email);
      paramIndex++;
    }

    if (userData.passwordHash) {
      updates.push(`password_hash = $${paramIndex}`);
      values.push(userData.passwordHash);
      paramIndex++;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, email, role, created_at, updated_at
    `;

    const result = (await dbQuery(query, values)) as {
      rows: {
        id: string;
        name: string;
        email: string;
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
      role: row.role,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error updating user:', error);
    return null;
  }
};

/**
 * Delete user by ID
 */
export const deleteUser = async (id: string): Promise<boolean> => {
  const dbQuery = await getDbQuery();
  if (!dbQuery) {
    // Mock delete for fallback
    const userIndex = mockUsers.findIndex(u => u.id === id);
    if (userIndex === -1) return false;
    mockUsers.splice(userIndex, 1);
    return true;
  }

  try {
    const result = (await dbQuery(userQueries.deleteUser, [id])) as {
      rowCount: number;
    };

    return result.rowCount > 0;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error deleting user:', error);
    return false;
  }
};

/**
 * Get total user count
 */
export const getUserCount = async (): Promise<number> => {
  const dbQuery = await getDbQuery();
  if (!dbQuery) {
    return mockUsers.length;
  }

  try {
    const result = (await dbQuery(userQueries.getUserCount)) as {
      rows: { total: string }[];
    };

    return parseInt(result.rows[0]?.total ?? '0', 10);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error getting user count:', error);
    return mockUsers.length;
  }
};
