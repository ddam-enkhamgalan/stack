# Database Guide

This guide covers database setup, schema, and management for the Stack project using PostgreSQL.

## 🗄️ Database Overview

The Stack project uses PostgreSQL 16 as its primary database, with different configurations for development and production environments.

### Production (AWS RDS)
- **Engine**: PostgreSQL 16
- **Instance**: db.t3.micro (production can be scaled)
- **Storage**: GP3 with auto-scaling
- **Backup**: Automated daily backups with 7-day retention
- **Security**: VPC-only access, encrypted at rest and in transit

### Development (Local/Docker)
- **Engine**: PostgreSQL 16 (Docker container)
- **Host**: localhost:5432
- **Database**: stack
- **Credentials**: root/root (development only)

## 🚀 Quick Setup

### Local Development with Docker

```bash
# Start PostgreSQL container
cd docker
docker-compose up postgres

# Initialize database schema
cd ../api
npm run db:init
```

### Local PostgreSQL Installation

```bash
# macOS with Homebrew
brew install postgresql@16
brew services start postgresql@16

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql-16 postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres createdb stack
sudo -u postgres createuser -s root
sudo -u postgres psql -c "ALTER USER root PASSWORD 'root';"
```

## 📋 Database Schema

### Core Tables

#### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_name ON users(name);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### User Profiles Table (Extended Information)
```sql
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    avatar_url VARCHAR(500),
    phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### User Sessions Table (JWT Session Management)
```sql
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
```

### Extended Tables (Future Use)
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Departments Table
```sql
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    manager_id UUID REFERENCES users(id),
    budget DECIMAL(12, 2),
    location VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_departments_name ON departments(name);
CREATE INDEX idx_departments_manager ON departments(manager_id);
CREATE INDEX idx_departments_active ON departments(is_active);

CREATE TRIGGER update_departments_updated_at 
    BEFORE UPDATE ON departments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Audit Log Table
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);
```

## 🔧 Environment Configuration

### Development (.env)
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stack
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false

# Connection Pool
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_POOL_IDLE_TIMEOUT=30000

# Alternative: DATABASE_URL
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/stack
```

### Production (AWS Secrets Manager)
```json
{
  "username": "stack_user",
  "password": "auto-generated-secure-password",
  "engine": "postgres",
  "host": "stack-database.cluster-xxxxx.us-east-1.rds.amazonaws.com",
  "port": 5432,
  "dbname": "stack",
  "dbClusterIdentifier": "stack-database"
}
```

## 🛠️ Database Management

### Initialize Database Schema

```bash
cd api
npm run db:init
```

This script:
1. Tests database connectivity
2. Creates all tables with proper relationships
3. Sets up indexes and triggers
4. Inserts sample data for development

### Migration Scripts

```bash
# Run pending migrations
npm run db:migrate

# Create new migration
npm run db:migrate:create -- migration-name

# Rollback last migration
npm run db:migrate:rollback
```

### Backup and Restore

#### Local Development
```bash
pg_dump -h localhost -U root stack > backup.sql

# Restore database
psql -h localhost -U root stack < backup.sql
```

#### Production (AWS RDS)
```bash
# Automated backups are enabled with 7-day retention
# Manual snapshots can be created in AWS Console

# Export data
pg_dump -h <rds-endpoint> -U <username> stack > production_backup.sql
```

### Data Seeding

#### Development Sample Data
```sql
-- Sample users (matching current API implementation)
INSERT INTO users (name, email, password_hash) VALUES
('Admin User', 'admin@stack.com', '$2b$10$example.hash.for.password123'),
('John Doe', 'john.doe@stack.com', '$2b$10$example.hash.for.password456');

-- Sample user profiles
INSERT INTO user_profiles (user_id, bio, phone) VALUES
(1, 'System administrator', '+1-555-0001'),
(2, 'Software developer', '+1-555-0002');
```

## 📊 Performance Optimization

### Indexes
```sql
-- Composite indexes for common queries
CREATE INDEX idx_users_role_department ON users(role, department);
CREATE INDEX idx_users_active_created ON users(is_active, created_at);

-- Partial indexes for active records only
CREATE INDEX idx_active_users_email ON users(email) WHERE is_active = true;
```

### Connection Pooling
```typescript
// Database pool configuration
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  min: 2,           // Minimum connections
  max: 10,          // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Query Optimization
```sql
-- Use EXPLAIN ANALYZE to check query performance
EXPLAIN ANALYZE SELECT * FROM users WHERE department = 'Engineering' AND is_active = true;

-- Monitor slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

## 🔐 Security Best Practices

### Access Control
```sql
-- Create application user with limited privileges
CREATE USER stack_app WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE stack TO stack_app;
GRANT USAGE ON SCHEMA public TO stack_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO stack_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO stack_app;
```

### Row Level Security (RLS)
```sql
-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy example: Users can only see their own data
CREATE POLICY user_own_data ON users
    FOR ALL TO stack_app
    USING (id = current_setting('app.current_user_id')::uuid);
```

### Data Encryption
```sql
-- Encrypt sensitive fields
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Example: Encrypt phone numbers
UPDATE users SET phone = pgp_sym_encrypt(phone, 'encryption_key');
```

## 📈 Monitoring

### Database Metrics
```sql
-- Connection count
SELECT count(*) FROM pg_stat_activity;

-- Database size
SELECT pg_size_pretty(pg_database_size('stack'));

-- Table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage
SELECT schemaname, tablename, indexname, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_tup_read DESC;
```

### AWS CloudWatch Metrics
- **DatabaseConnections**: Monitor connection pool usage
- **CPUUtilization**: Database CPU usage
- **FreeableMemory**: Available memory
- **DatabaseConnections**: Active connections
- **ReadLatency/WriteLatency**: Query performance

## 🚨 Troubleshooting

### Common Issues

#### Connection Errors
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check port accessibility
telnet localhost 5432

# Verify credentials
psql -h localhost -U root stack
```

#### Performance Issues
```sql
-- Check for long-running queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';

-- Check for table locks
SELECT relation, mode, granted FROM pg_locks WHERE relation IS NOT NULL;
```

#### Disk Space Issues
```sql
-- Check database sizes
SELECT datname, pg_size_pretty(pg_database_size(datname)) FROM pg_database;

-- Check table bloat
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
       pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Recovery Procedures

#### Point-in-Time Recovery (AWS RDS)
1. Identify the target recovery time
2. Create new RDS instance from backup
3. Apply transaction logs up to target time
4. Update application connection strings
5. Verify data integrity

#### Local Development Reset
```bash
# Drop and recreate database
psql -h localhost -U postgres -c "DROP DATABASE IF EXISTS stack;"
psql -h localhost -U postgres -c "CREATE DATABASE stack;"

# Re-run initialization
cd api
npm run db:init
```

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [AWS RDS PostgreSQL Guide](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html)
- [Database Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Security Best Practices](https://www.postgresql.org/docs/current/security.html)
