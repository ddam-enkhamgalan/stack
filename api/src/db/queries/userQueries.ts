/**
 * User database queries
 * SQL query definitions for user operations
 */

export const userQueries = {
  // Get all users with pagination support
  getAllUsers: `
    SELECT id, name, email, role, created_at, updated_at 
    FROM users 
    ORDER BY created_at DESC 
    LIMIT $1 OFFSET $2
  `,

  // Get user by ID
  getUserById: `
    SELECT id, name, email, role, created_at, updated_at 
    FROM users 
    WHERE id = $1
  `,

  // Get user by email (includes password hash for auth)
  getUserByEmail: `
    SELECT id, name, email, password_hash, role, created_at, updated_at 
    FROM users 
    WHERE email = $1
  `,

  // Get user by email (without password hash)
  getUserByEmailSafe: `
    SELECT id, name, email, role, created_at, updated_at 
    FROM users 
    WHERE email = $1
  `,

  // Create new user
  createUser: `
    INSERT INTO users (name, email, password_hash) 
    VALUES ($1, $2, $3) 
    RETURNING id, name, email, role, created_at, updated_at
  `,

  // Update user (dynamic query built in operation)
  updateUserBase: `
    UPDATE users 
    SET updated_at = CURRENT_TIMESTAMP
  `,

  // Delete user
  deleteUser: `
    DELETE FROM users 
    WHERE id = $1
  `,

  // Check if email exists (for validation)
  checkEmailExists: `
    SELECT EXISTS(SELECT 1 FROM users WHERE email = $1 AND id != $2)
  `,

  // Get user count (for pagination)
  getUserCount: `
    SELECT COUNT(*) as total FROM users
  `,
} as const;
