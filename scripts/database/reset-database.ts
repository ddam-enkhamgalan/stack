#!/usr/bin/env node

import { dbQuery, closeDatabasePool, testDatabaseConnection } from '../../api/src/utils/database.js';

// Function to drop all tables
const dropTables = async (): Promise<void> => {
  try {
    // eslint-disable-next-line no-console
    console.log('Dropping all tables...');

    // Drop tables in reverse order to avoid foreign key constraints
    const dropQueries = [
      'DROP TABLE IF EXISTS user_sessions CASCADE;',
      'DROP TABLE IF EXISTS user_profiles CASCADE;', 
      'DROP TABLE IF EXISTS users CASCADE;',
      'DROP TABLE IF EXISTS audit_logs CASCADE;',
      'DROP TABLE IF EXISTS departments CASCADE;'
    ];

    for (const query of dropQueries) {
      await dbQuery(query);
    }

    // eslint-disable-next-line no-console
    console.log('✓ All tables dropped successfully');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error dropping tables:', error);
    throw error;
  }
};

// Function to reset database sequences and extensions
const resetDatabase = async (): Promise<void> => {
  try {
    // eslint-disable-next-line no-console
    console.log('Resetting database...');

    // Drop and recreate UUID extension to ensure clean state
    await dbQuery('DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;');
    await dbQuery('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    // eslint-disable-next-line no-console
    console.log('✓ Database reset successfully');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error resetting database:', error);
    throw error;
  }
};

// Main function
const main = async (): Promise<void> => {
  try {
    // eslint-disable-next-line no-console
    console.log('🗑️  Starting database reset...');
    // eslint-disable-next-line no-console
    console.log('============================');

    // Test database connection
    // eslint-disable-next-line no-console
    console.log('Testing database connection...');
    const connectionResult = await testDatabaseConnection();
    // eslint-disable-next-line no-console
    console.log('Database connection successful:', connectionResult);

    // Drop all tables
    await dropTables();

    // Reset database
    await resetDatabase();

    // eslint-disable-next-line no-console
    console.log('');
    // eslint-disable-next-line no-console
    console.log('✅ Database reset completed successfully!');
    // eslint-disable-next-line no-console
    console.log('💡 Run "npm run db:init" to reinitialize with fresh tables');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  } finally {
    await closeDatabasePool();
    // eslint-disable-next-line no-console
    console.log('Database pool closed');
  }
};

// Run the script only if it's executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  void main();
}

export { dropTables, resetDatabase };
