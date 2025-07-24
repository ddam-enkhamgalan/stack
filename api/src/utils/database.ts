import { Pool, type PoolConfig, type QueryResult } from 'pg';

// Database configuration interface
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean;
}

// AWS Secrets Manager interface (simplified)
interface SecretsManagerCredentials {
  username: string;
  password: string;
  host: string;
  port: number;
  dbname: string;
  engine: string;
}

// Get database configuration from environment variables or AWS Secrets Manager
const getDatabaseConfig = (): DatabaseConfig => {
  // If running locally or in development, use environment variables
  if (process.env.NODE_ENV === 'development' || !process.env.DB_CREDENTIALS) {
    return {
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      database: process.env.DB_NAME ?? 'stack',
      user: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      ssl: process.env.DB_SSL === 'true',
    };
  }

  // In production/ECS, parse credentials from AWS Secrets Manager
  try {
    const credentials = JSON.parse(
      process.env.DB_CREDENTIALS
    ) as SecretsManagerCredentials;
    return {
      host: credentials.host,
      port: credentials.port,
      database: credentials.dbname,
      user: credentials.username,
      password: credentials.password,
      ssl: process.env.DB_SSL === 'true',
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      'Failed to parse DB_CREDENTIALS from Secrets Manager:',
      error
    );
    throw new Error('Invalid database credentials configuration');
  }
};

// Create PostgreSQL connection pool
const createPool = (): Pool => {
  const config = getDatabaseConfig();

  const poolConfig: PoolConfig = {
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    ssl: config.ssl ? { rejectUnauthorized: false } : false,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle
    connectionTimeoutMillis: 10000, // How long to wait when connecting a new client
  };

  const pool = new Pool(poolConfig);

  // Handle pool errors
  pool.on('error', (err: Error) => {
    // eslint-disable-next-line no-console
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });

  return pool;
};

// Global database pool instance
let dbPool: Pool | null = null;

// Get or create database pool
export const getDbPool = (): Pool => {
  dbPool ??= createPool();
  return dbPool;
};

// Test database connection
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    const pool = getDbPool();
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    client.release();

    // eslint-disable-next-line no-console
    console.log('Database connection successful:', result.rows[0]);
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Database connection failed:', error);
    return false;
  }
};

// Close database pool
export const closeDatabasePool = async (): Promise<void> => {
  if (dbPool) {
    await dbPool.end();
    dbPool = null;
    // eslint-disable-next-line no-console
    console.log('Database pool closed');
  }
};

// Database query helper with error handling
export const dbQuery = async (
  text: string,
  params?: unknown[]
): Promise<QueryResult> => {
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    const start = Date.now();
    const result = await client.query(text, params);
    const duration = Date.now() - start;

    // eslint-disable-next-line no-console
    console.log('Query executed', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Database query error:', { text, params, error });
    throw error;
  } finally {
    client.release();
  }
};

// Health check query
export const healthCheck = async (): Promise<{
  healthy: boolean;
  message: string;
}> => {
  try {
    await dbQuery('SELECT 1 as health_check');
    return {
      healthy: true,
      message: 'Database connection healthy',
    };
  } catch (error) {
    return {
      healthy: false,
      message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
};

export default {
  getDbPool,
  testDatabaseConnection,
  closeDatabasePool,
  dbQuery,
  healthCheck,
};
