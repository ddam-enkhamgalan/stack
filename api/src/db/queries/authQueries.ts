/**
 * Authentication database queries
 * SQL query definitions for auth operations
 */

export const authQueries = {
  // Get user for authentication (includes password hash)
  getUserForAuth: `
    SELECT id, name, email, password_hash, role, created_at, updated_at 
    FROM users 
    WHERE email = $1
  `,

  // Get user by ID for token refresh
  getUserForRefresh: `
    SELECT id, name, email, password_hash, role, created_at, updated_at 
    FROM users 
    WHERE id = $1
  `,

  // Create user during registration
  registerUser: `
    INSERT INTO users (name, email, password_hash) 
    VALUES ($1, $2, $3) 
    RETURNING id, name, email, role, created_at, updated_at
  `,

  // Update last login timestamp
  updateLastLogin: `
    UPDATE users 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = $1
  `,

  // Check if user exists by email
  checkUserExists: `
    SELECT EXISTS(SELECT 1 FROM users WHERE email = $1) as exists
  `,
} as const;
