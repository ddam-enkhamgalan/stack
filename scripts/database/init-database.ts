#!/usr/bin/env node

import { dbQuery, closeDatabasePool, testDatabaseConnection } from '../../api/src/utils/database.js';
import { hashPassword } from '../../api/src/utils/auth.js';

// Enable UUID extension
const enableUuidExtension = `
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
`;

// SQL statements for creating tables
const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const createUserProfilesTable = `
  CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    avatar_url VARCHAR(500),
    phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const createSessionsTable = `
  CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

// Function to create database tables
const createTables = async (): Promise<void> => {
  try {
    // eslint-disable-next-line no-console
    console.log('Creating database tables...');

    // Enable UUID extension first
    await dbQuery(enableUuidExtension);
    // eslint-disable-next-line no-console
    console.log('✓ UUID extension enabled');

    await dbQuery(createUsersTable);
    // eslint-disable-next-line no-console
    console.log('✓ Users table created');

    await dbQuery(createUserProfilesTable);
    // eslint-disable-next-line no-console
    console.log('✓ User profiles table created');

    await dbQuery(createSessionsTable);
    // eslint-disable-next-line no-console
    console.log('✓ User sessions table created');

    // eslint-disable-next-line no-console
    console.log('All tables created successfully!');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error creating tables:', error);
    throw error;
  }
};

// Function to seed initial data
const seedData = async (): Promise<void> => {
  try {
    // eslint-disable-next-line no-console
    console.log('Seeding initial data...');

    // Check if we already have users
    const existingUsers = await dbQuery('SELECT COUNT(*) as count FROM users');
    const userCount = parseInt(existingUsers.rows[0]?.count as string || '0', 10);

    if (userCount > 0) {
      // eslint-disable-next-line no-console
      console.log('Database already has users, skipping seed data');
      return;
    }

    // Insert admin user with proper password hashing
    const insertUser = `
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;

    // Hash the password properly
    const hashedPassword = await hashPassword('qwertyQ123!');

    const adminUser = await dbQuery(insertUser, [
      'Tester',
      'amgaa.lcs@gmail.com',
      hashedPassword,
      'admin'
    ]);

    // eslint-disable-next-line no-console
    console.log('✓ Admin user created');

    // Insert admin profile
    const insertProfile = `
      INSERT INTO user_profiles (user_id, bio, phone)
      VALUES ($1, $2, $3);
    `;

    await dbQuery(insertProfile, [
      adminUser.rows[0]?.id,
      'System administrator',
      '+976-88888888'
    ]);

    // eslint-disable-next-line no-console
    console.log('✓ Admin profile created');

    // eslint-disable-next-line no-console
    console.log('✓ Admin profile created');
    // eslint-disable-next-line no-console
    console.log('Database seeding completed successfully!');

  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error seeding data:', error);
    throw error;
  }
};

// Main initialization function
const initializeDatabase = async (): Promise<void> => {
  try {
    // eslint-disable-next-line no-console
    console.log('Starting database initialization...');

    // Test connection first
    const isConnected = await testDatabaseConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }

    // Create tables
    await createTables();

    // Seed initial data
    await seedData();

    // eslint-disable-next-line no-console
    console.log('Database initialization completed successfully!');

  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Database initialization failed:', error);
    process.exit(1);
  } finally {
    // Close database connections
    await closeDatabasePool();
  }
};

// Run initialization if this script is called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  void initializeDatabase();
}

export { initializeDatabase, createTables, seedData };
