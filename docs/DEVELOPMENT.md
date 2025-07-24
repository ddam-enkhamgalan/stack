# Development Guide

This guide covers local development setup, workflows, and best practices for the Stack project.

## 🛠️ Development Environment Setup

### Prerequisites

#### Required Software
- **Node.js**: Version 20.0.0 or higher
- **npm**: Version 9.0.0 or higher  
- **Docker**: For database and containerization
- **Git**: Version control
- **VS Code**: Recommended IDE (with extensions)

#### Recommended VS Code Extensions
- TypeScript Hero
- ESLint
- Prettier - Code formatter
- Thunder Client (API testing)
- Docker
- GitLens

### Initial Setup

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd project
   ```

2. **Install Dependencies for All Services**
   ```bash
   # API dependencies
   cd api
   npm install
   
   # Client dependencies  
   cd ../client
   npm install
   
   # Lambda services dependencies
   cd ../services
   npm install
   
   # Return to project root
   cd ..
   ```

3. **Set Up Environment Files**
   ```bash
   # API environment
   cp api/.env.example api/.env
   
   # Edit with your local configuration
   nano api/.env
   ```

4. **Start Development Database**
   ```bash
   cd docker
   docker-compose up postgres -d
   ```

5. **Initialize Database**
   ```bash
   cd api
   npm run db:init
   ```

## 🚀 Development Workflow

### Quick Start Script

Use the provided development script for easy setup:

```bash
# Start all development services
./scripts/dev.sh

# This will:
# - Start PostgreSQL database
# - Initialize database schema  
# - Start API server with hot reload
# - Start client development server
# - Open browser tabs for each service
```

### Manual Development Workflow

#### Start Database
```bash
cd docker
docker-compose up postgres -d
```

#### Start API Server
```bash
cd api
npm run dev
```
- API available at: http://localhost:3000
- Health check: http://localhost:3000/health
- API docs: http://localhost:3000/api-docs

#### Start Client Development Server
```bash
cd client  
npm run dev
```
- Client available at: http://localhost:4000
- Hot reload enabled for React components

#### Test Lambda Functions Locally
```bash
cd services
npm run build
npm run test:local
```

## 📂 Project Structure Overview

```
project/
├── api/                     # Express.js API server
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # Database & utility functions
│   │   ├── messages/       # i18n message files
│   │   └── types/          # TypeScript definitions
│   ├── scripts/            # Database & development scripts
│   └── docs/              # API-specific documentation
├── client/                 # Next.js 15 frontend
│   ├── app/               # Next.js app router
│   ├── components/        # React components
│   └── lib/              # Client-side utilities
├── services/              # AWS Lambda functions
│   ├── user-service.ts    # User management microservice
│   └── notification-service.ts # Notification microservice
├── terraform/             # Infrastructure as Code
├── docker/               # Container configurations
├── scripts/              # Project automation scripts
└── docs/                # Consolidated documentation
```

## 💻 Development Commands

### API Development
```bash
cd api

# Development server with hot reload
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start

# Database operations
npm run db:init              # Initialize schema
npm run db:migrate          # Run migrations
npm run db:seed             # Seed test data

# Code quality
npm run lint                # Check code style
npm run lint:fix            # Auto-fix issues
npm run format              # Format with Prettier
npm run type-check          # TypeScript validation

# Documentation
npm run docs:generate       # Generate OpenAPI schema
npm run docs:serve          # Serve API docs locally
npm run docs:validate       # Validate API schema
```

### Client Development
```bash
cd client

# Development server
npm run dev

# Production build
npm run build
npm start

# Code quality
npm run lint
npm run lint:fix
npm run type-check

# Testing
npm run test
npm run test:watch
```

### Lambda Services Development
```bash
cd services

# Build TypeScript
npm run build

# Package for deployment
npm run package

# Code quality
npm run lint
npm run lint:fix
npm run format

# Local testing
npm run test:local
```

## 🔧 Configuration

### API Configuration (.env)

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stack
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false

# Server
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:4000

# Internationalization
API_LANGUAGE=en

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Documentation
API_TITLE="Stack API"
API_DESCRIPTION="Stack platform API"
API_VERSION="1.0.0"
DOCS_SERVER_PORT=3000
```

### Client Configuration

#### next.config.ts
```typescript
const nextConfig = {
  env: {
    API_BASE_URL: 'http://localhost:3000',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-cdn-domain.com',
      },
    ],
  },
};
```

### Docker Development

#### Start Only Database
```bash
cd docker
docker-compose up postgres -d
```

#### Full Docker Development
```bash
cd docker
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

#### Reset Development Environment
```bash
cd docker
docker-compose down -v
docker-compose up postgres -d

cd ../api
npm run db:init
```

## 🧪 Testing

### API Testing

#### Manual Testing with curl
```bash
# Health check
curl http://localhost:3000/health

# Get users
curl http://localhost:3000/api/users

# Create user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123"}'
```

#### Using Thunder Client (VS Code)
1. Install Thunder Client extension
2. Import collection from `api/docs/thunder-client.json`
3. Test all endpoints interactively

### Lambda Function Testing

#### Local Invocation
```bash
cd services

# Test user service
node -e "
const { handler } = require('./dist/user-service.js');
handler({
  httpMethod: 'GET',
  path: '/users',
  body: null
}).then(console.log);
"
```

### Database Testing

#### Connection Test
```bash
cd api
npm run db:test-connection
```

#### Schema Validation
```bash
cd api
npm run db:validate-schema
```

## 🎨 Code Standards

### TypeScript Configuration

All sub-projects use consistent TypeScript configuration:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  }
}
```

### ESLint Configuration

Consistent linting across all TypeScript files:

```javascript
module.exports = [
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prettier/prettier': 'error',
      'no-console': 'warn'
    }
  }
];
```

### Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### Git Workflow

#### Commit Message Convention
```bash
feat: add user authentication endpoint
fix: resolve database connection timeout
docs: update API documentation
style: format code with prettier
refactor: optimize database queries
test: add user service unit tests
chore: update dependencies
```

#### Branch Naming
```bash
feature/user-authentication
fix/database-connection-timeout
docs/api-documentation-update
refactor/database-optimization
```

## 🔍 Debugging

### API Debugging

#### Enable Debug Logging
```bash
DEBUG=app:* npm run dev
```

#### VS Code Debug Configuration
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug API",
  "program": "${workspaceFolder}/api/src/index.ts",
  "outFiles": ["${workspaceFolder}/api/dist/**/*.js"],
  "env": {
    "NODE_ENV": "development"
  },
  "envFile": "${workspaceFolder}/api/.env"
}
```

### Database Debugging

#### Query Logging
```typescript
// Add to database configuration
const pool = new Pool({
  // ... other config
  log: (msg) => console.log('DB:', msg)
});
```

#### Connection Pool Monitoring
```typescript
console.log('Total connections:', pool.totalCount);
console.log('Idle connections:', pool.idleCount);
console.log('Waiting clients:', pool.waitingCount);
```

### Client Debugging

#### Next.js Debug Mode
```bash
npm run dev -- --inspect
```

#### React Developer Tools
Install the browser extension for component debugging.

## 🚀 Performance Optimization

### Development Performance

#### API Hot Reload
Using `tsx` for fast TypeScript compilation:
```bash
npm run dev  # Uses tsx --watch
```

#### Database Connection Pooling
```typescript
const pool = new Pool({
  min: 2,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

#### Client Optimization
```bash
# Bundle analysis
npm run build:analyze

# Performance profiling
npm run dev -- --profile
```

## 📊 Monitoring in Development

### API Monitoring

#### Request Logging
All API requests are logged with timing information:
```
GET /api/users 200 45ms
POST /api/users 201 120ms
```

#### Health Check Monitoring
```bash
# Continuous health monitoring
watch -n 5 "curl -s http://localhost:3000/health | jq"
```

### Database Monitoring

#### Connection Monitoring
```sql
-- Monitor active connections
SELECT count(*) FROM pg_stat_activity;

-- Monitor query performance
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

## 🛠️ Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3000 npm run dev
```

#### Database Connection Errors
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart database container
cd docker
docker-compose restart postgres

# Check database logs
docker logs docker_postgres_1
```

#### TypeScript Compilation Errors
```bash
# Clean build artifacts
npm run clean
npm run build

# Check TypeScript configuration
npx tsc --noEmit
```

#### Package Installation Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Development Environment Reset

Complete reset of development environment:

```bash
# Stop all containers
cd docker
docker-compose down -v

# Clean API
cd ../api
rm -rf node_modules dist
npm install

# Clean client
cd ../client
rm -rf node_modules .next
npm install

# Clean services
cd ../services
rm -rf node_modules dist *.zip
npm install

# Restart development environment
cd ../
./scripts/dev.sh
```

## 📚 Additional Resources

### Documentation
- [API Documentation](API.md)
- [Database Guide](DATABASE.md)
- [Deployment Guide](DEPLOYMENT.md)

### External Resources
- [Express.js Documentation](https://expressjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)

### Community & Support
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)
- [React Best Practices](https://react.dev/learn)

## 🤝 Contributing Guidelines

1. **Code Quality**: All code must pass ESLint and Prettier checks
2. **Types**: Use TypeScript strictly, avoid `any` types
3. **Testing**: Add tests for new features
4. **Documentation**: Update relevant documentation
5. **Git**: Follow conventional commit messages
6. **Review**: All changes require code review

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project standards
- [ ] Documentation updated
- [ ] No breaking changes
```
