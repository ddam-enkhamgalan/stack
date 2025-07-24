# Scripts Documentation

This directory contains organized automation scripts for the Stack project.

## 📁 Directory Structure

```
scripts/
├── 🔧 Root Scripts (Project-wide operations)
│   ├── dev.sh              # Start complete development environment
│   ├── deploy.sh           # Deploy to AWS infrastructure  
│   ├── clean.sh            # Clean build artifacts and containers
│   └── health-check.sh     # Check service health status
├── 📊 api/                 # API-specific scripts
│   └── test-messages.ts    # Test internationalization system
├── 🗄️ database/            # Database management scripts
│   ├── init-database.ts    # Initialize database schema and data
│   └── reset-database.ts   # Reset database to clean state
└── 🧪 testing/             # Testing and validation scripts  
    ├── test-complete-auth.sh   # Test complete authentication flow
    ├── test-admin.sh           # Test admin functionality
    ├── test-uuid-auth.sh       # Test UUID-based authentication
    └── demo-uuid-reset.sh      # Reset demo data for testing
```

## 🚀 Root Scripts

### `dev.sh` - Development Environment
Starts the complete development environment with all services.

```bash
./scripts/dev.sh
```

**What it does:**
1. Builds Lambda services
2. Starts PostgreSQL database with Docker
3. Initializes database schema
4. Starts API server in development mode
5. Starts Next.js frontend

**Services available after running:**
- Frontend: http://localhost:4000
- API: http://localhost:3000
- API Docs: http://localhost:3000/api-docs
- Database: localhost:5432

### `deploy.sh` - AWS Deployment
Deploys the complete infrastructure to AWS.

```bash
./scripts/deploy.sh
```

**Prerequisites:**
- AWS CLI configured with appropriate permissions
- Terraform installed
- Docker available for building images

**What it deploys:**
- ECS cluster with API service
- RDS PostgreSQL database
- Lambda functions
- Application Load Balancer
- All necessary AWS networking and security resources

### `clean.sh` - Cleanup
Removes build artifacts, Docker containers, and temporary files.

```bash
./scripts/clean.sh
```

**What it cleans:**
- Docker containers and images
- Node.js build artifacts (`dist/`, `build/`)
- Log files
- Temporary files

### `health-check.sh` - Health Verification
Checks the health status of all services.

```bash
./scripts/health-check.sh
```

**What it checks:**
- API server responsiveness
- Database connectivity
- Service endpoints availability
- Authentication system functionality

## 🗄️ Database Scripts

### `init-database.ts` - Database Initialization
Creates the database schema and inserts initial data.

```bash
cd scripts/database && npm run exec -- ts-node init-database.ts
# OR from API directory:
cd api && npm run db:init
```

**What it creates:**
- User tables with UUID primary keys
- Authentication tables
- Initial admin user
- Database indexes and constraints

### `reset-database.ts` - Database Reset
Drops all tables and recreates the schema with fresh data.

```bash
cd scripts/database && npm run exec -- ts-node reset-database.ts
# OR from API directory:
cd api && npm run db:reset
```

**⚠️ Warning:** This will permanently delete all data in the database.

## 🧪 Testing Scripts

### `test-complete-auth.sh` - Authentication Flow Testing
Tests the complete authentication workflow including login, token refresh, and protected routes.

```bash
./scripts/testing/test-complete-auth.sh
```

**What it tests:**
- User registration
- Login with email/password
- JWT token validation
- Token refresh functionality
- Protected route access
- Logout workflow

### `test-admin.sh` - Admin Functionality Testing
Tests administrative functions and permissions.

```bash
./scripts/testing/test-admin.sh
```

**What it tests:**
- Admin user creation
- User management operations
- Permission-based access control
- Administrative API endpoints

### `test-uuid-auth.sh` - UUID Authentication Testing
Tests UUID-based user identification and authentication.

```bash
./scripts/testing/test-uuid-auth.sh
```

**What it tests:**
- UUID generation and validation
- UUID-based user lookup
- Authentication with UUID identifiers

### `demo-uuid-reset.sh` - Demo Data Reset
Resets the database with demo data for testing purposes.

```bash
./scripts/testing/demo-uuid-reset.sh
```

**What it creates:**
- Sample users with different roles
- Test data for development
- Demo authentication tokens

## 📊 API Scripts

### `test-messages.ts` - Internationalization Testing
Tests the message system and internationalization functionality.

```bash
cd scripts/api && npm run exec -- ts-node test-messages.ts
```

**What it tests:**
- Message loading from JSON files
- Language switching functionality
- Message interpolation
- Default fallback behavior

## 🔧 Usage Patterns

### Development Workflow
```bash
# 1. Start development environment
./scripts/dev.sh

# 2. Initialize/reset database if needed
cd api && npm run db:reset

# 3. Run tests to verify functionality
./scripts/testing/test-complete-auth.sh

# 4. Check health status
./scripts/health-check.sh
```

### Deployment Workflow
```bash
# 1. Clean previous builds
./scripts/clean.sh

# 2. Test locally first
./scripts/dev.sh
./scripts/testing/test-complete-auth.sh

# 3. Deploy to AWS
./scripts/deploy.sh

# 4. Verify deployment
./scripts/health-check.sh
```

### Testing Workflow
```bash
# Run all authentication tests
./scripts/testing/test-complete-auth.sh
./scripts/testing/test-admin.sh
./scripts/testing/test-uuid-auth.sh

# Test API-specific functionality
cd scripts/api && npm run exec -- ts-node test-messages.ts
```

## 🚨 Troubleshooting

### Common Issues

**Database Connection Errors**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart database
cd docker && docker-compose -f docker-compose.dev.yml restart postgres

# Reinitialize database
cd api && npm run db:reset
```

**Port Already in Use**
```bash
# Check what's using the port
lsof -i :3000  # API port
lsof -i :4000  # Client port

# Kill processes if needed
kill -9 <PID>
```

**Permission Errors**
```bash
# Make scripts executable
chmod +x scripts/*.sh
chmod +x scripts/testing/*.sh
```

**AWS Deployment Issues**
```bash
# Verify AWS credentials
aws sts get-caller-identity

# Check Terraform state
cd terraform && terraform plan
```

## 📝 Script Maintenance

### Adding New Scripts
1. Place in appropriate subdirectory (`api/`, `database/`, `testing/`)
2. Make executable: `chmod +x script-name.sh`
3. Add documentation to this README
4. Test thoroughly before committing

### Script Conventions
- Use `.sh` extension for shell scripts
- Use `.ts` extension for TypeScript scripts
- Include error handling and informative output
- Add usage comments at the top of each script
- Use consistent naming patterns

## 🔗 Related Documentation

- [Development Guide](../docs/DEVELOPMENT.md) - Local development setup
- [Deployment Guide](../docs/DEPLOYMENT.md) - AWS deployment details
- [Database Guide](../docs/DATABASE.md) - Database schema and operations
- [API Documentation](../docs/API.md) - API endpoints and usage
