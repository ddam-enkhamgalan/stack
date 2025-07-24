# Stack API Server

Express.js 5.1 TypeScript API server with layered architecture, JWT authentication, and comprehensive OpenAPI documentation.

> 📚 **Main Documentation**: See the [project documentation](../docs/README.md) for comprehensive guides.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables (copy from .env.example)
cp .env.example .env

# Initialize database
npm run db:init

# Start development server
npm run dev
```

**API Available at**: `http://localhost:3000`  
**API Documentation**: `http://localhost:3000/api-docs`  
**Health Check**: `http://localhost:3000/health`

## 📁 New Architecture (After Code Splitting)

```
src/
├── database/              # Database layer (NEW)
│   ├── operations/        # Database CRUD operations
│   │   ├── userOperations.ts
│   │   └── authOperations.ts
│   └── queries/           # SQL query definitions  
│       ├── userQueries.ts
│       └── authQueries.ts
├── services/              # Business logic layer (NEW)
│   ├── userService.ts
│   └── authService.ts
├── routes/                # HTTP routes (REFACTORED)
│   ├── userRoutes.ts
│   └── authRoutes.ts
├── middleware/            # Express middleware
├── types/                 # TypeScript definitions
├── messages/              # Internationalization
├── config/                # Configuration
└── utils/                 # Utilities
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build production bundle
npm run start        # Start production server
npm run test         # Run test suite
npm run lint         # Run ESLint
npm run db:init      # Initialize database schema
npm run db:reset     # Reset database to clean state
```

## 🔒 Authentication

- **JWT Tokens** with automatic refresh
- **Role-based access** control
- **Secure password** hashing with bcrypt
- **Session management** with refresh tokens

### API Testing
```bash
# Test complete authentication flow
../scripts/testing/test-complete-auth.sh

# Test admin functionality
../scripts/testing/test-admin.sh

# Test UUID-based auth
../scripts/testing/test-uuid-auth.sh
```

## 📊 API Documentation

- **Interactive Docs**: Visit `/api-docs` when server is running
- **OpenAPI Schema**: Available at `/openapi.json`
- **Adding Endpoints**: See [OpenAPI Guide](../docs/OPENAPI_GUIDE.md)

## 🌐 Internationalization

API supports multiple languages controlled by `API_LANGUAGE` environment variable:

```bash
API_LANGUAGE=en    # English (default)
API_LANGUAGE=mn    # Mongolian
API_LANGUAGE=ja    # Japanese
```

**Message Files**: `src/messages/`  
**Documentation**: [Messages System Guide](../docs/MESSAGES.md)

## 🗄️ Database

- **PostgreSQL** with UUID primary keys
- **Connection pooling** with pg
- **Migrations**: Handled via TypeScript scripts
- **Schema**: See [Database Guide](../docs/DATABASE.md)

### Database Commands
```bash
npm run db:init      # Create schema and initial data
npm run db:reset     # Reset to clean state (⚠️ deletes all data)
```

## 🏗️ Architecture Benefits

### Code Splitting Improvements
- ✅ **Database Layer**: Centralized queries and operations
- ✅ **Services Layer**: Reusable business logic
- ✅ **Routes Layer**: Clean HTTP endpoint handling
- ✅ **Type Safety**: Comprehensive TypeScript coverage

### Development Experience
- 🔄 **Hot Reload**: Automatic server restart on changes
- 🧪 **Testing**: Automated test scripts for all functionality
- 📊 **Monitoring**: Health checks and structured logging
- 🔧 **Debugging**: Clear error messages and stack traces

## 🔗 Related Documentation

- **[Main Documentation](../docs/README.md)** - Project overview and guides
- **[Architecture Guide](../ARCHITECTURE.md)** - Detailed architectural documentation
- **[Database Guide](../docs/DATABASE.md)** - Database setup and management
- **[Authentication Guide](../docs/authentication.md)** - Auth system details
- **[Deployment Guide](../docs/DEPLOYMENT.md)** - AWS deployment instructions

## 🚨 Troubleshooting

### Common Issues

**Database Connection Errors**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart database
cd ../docker && docker-compose -f docker-compose.dev.yml restart postgres
```

**Port Already in Use**
```bash
# Check what's using port 3000
lsof -i :3000

# Kill process if needed
kill -9 <PID>
```

**TypeScript Compilation Errors**
```bash
# Check compilation
npm run build

# Fix linting issues
npm run lint --fix
```

---

For comprehensive documentation and deployment instructions, see the [main project documentation](../docs/README.md).
│   └── index.ts     # Message loading utilities
├── middleware/      # Express middleware
│   ├── auth.ts      # JWT authentication middleware
│   ├── errorHandler.ts # Global error handler
│   └── logger.ts    # Request logging middleware
├── routes/          # API route handlers
│   ├── authRoutes.ts # Authentication endpoints
│   ├── userRoutes.ts # User management endpoints
│   └── index.ts     # Route aggregation
├── scripts/         # Utility scripts
│   ├── generateOpenApiSchema.ts # Generate API schema
│   ├── serveOpenApiDocs.ts     # Serve documentation
│   └── validateOpenApiSchema.ts # Validate API schema
├── types/           # TypeScript type definitions
│   └── index.ts     # Shared types
├── utils/           # Utility functions
│   ├── auth.ts      # JWT and password utilities
│   ├── database.ts  # Database connection and queries
│   └── helpers.ts   # General helper functions
└── index.ts         # Main application entry point

scripts/             # Database and testing scripts
├── init-database.ts # Database initialization
├── reset-database.ts # Database reset utility
├── test-messages.ts # Message system testing
└── *.sh            # Shell testing scripts
```

## 🛠️ Development Commands

### Core Development
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run quality      # Run all code quality checks
```

### Code Quality
```bash
npm run lint         # Check code style
npm run lint:fix     # Auto-fix linting issues
npm run format       # Format code with Prettier
npm run type-check   # TypeScript validation
```

### Database Operations
```bash
npm run db:init      # Initialize database schema
npm run db:reset     # Reset database (destructive)
npm run db:setup     # Reset and reinitialize database
```

### Documentation
```bash
npm run docs:generate # Generate OpenAPI schema
npm run docs:serve   # Serve API documentation
npm run docs:validate # Validate API schema
npm run dev:docs     # Development with docs server
```

### Testing
```bash
npm run test:messages # Test internationalization
npm run test:auth    # Test authentication flow
npm run test:uuid    # Test UUID authentication
npm run demo:reset   # Demo database reset
```

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

- **Access Tokens**: 24 hours validity
- **Refresh Tokens**: 7 days validity
- **Password Hashing**: bcrypt with 12 rounds
- **Algorithm**: HS256

### Authentication Flow

1. **Register**: `POST /api/auth/register`
2. **Login**: `POST /api/auth/login`
3. **Get Profile**: `GET /api/auth/profile` (requires auth)
4. **Refresh Token**: `POST /api/auth/refresh`

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### User Profiles Table
```sql
CREATE TABLE user_profiles (
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
```

### User Sessions Table
```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🌐 API Endpoints

### Health Check
- `GET /health` - Server health status

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/refresh` - Refresh access token

### Users
- `GET /api/users` - List all users (paginated)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 📚 Documentation

- **Swagger UI**: `http://localhost:3000/api-docs`
- **OpenAPI JSON**: `http://localhost:3000/openapi.json`
- **Health Check**: `http://localhost:3000/health`

## 🔧 Environment Variables

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stack
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false

# Server Configuration
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:4000

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRY=24h
JWT_REFRESH_EXPIRY=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100    # requests per window

# Internationalization
API_LANGUAGE=en                # Default language (en, ja, mn)

# Documentation
API_TITLE="Stack API"
API_DESCRIPTION="Stack platform API"
API_VERSION="1.0.0"
```

## 🏗️ Architecture

### Middleware Stack
1. **Helmet** - Security headers
2. **Rate Limiting** - Request throttling
3. **CORS** - Cross-origin resource sharing
4. **Compression** - Response compression
5. **Body Parsing** - JSON/URL-encoded parsing
6. **Custom Logger** - Request logging
7. **Routes** - API endpoints
8. **Error Handler** - Global error handling

### Database Layer
- **PostgreSQL** with UUID primary keys
- **Connection Pooling** for performance
- **Health Checks** for monitoring
- **Migration Scripts** for schema management

### Security Features
- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting per IP
- Security headers with Helmet
- UUID validation to prevent enumeration

## 🚦 Testing

### Manual Testing
```bash
# Health check
curl http://localhost:3000/health

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Automated Testing
```bash
# Run complete authentication test
npm run test:auth

# Test UUID system
npm run test:uuid

# Test message system
npm run test:messages
```

## 🔍 Monitoring & Debugging

### Logs
- Request/response logging via custom middleware
- Database query logging with timing
- Error logging with context

### Health Monitoring
- Database connection health
- Server uptime tracking
- Memory and performance metrics

## 📦 Dependencies

### Production Dependencies
- **express**: Web framework
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing
- **pg**: PostgreSQL client
- **cors**: Cross-origin resource sharing
- **helmet**: Security headers
- **compression**: Response compression
- **express-rate-limit**: Rate limiting

### Development Dependencies
- **typescript**: Type safety
- **tsx**: TypeScript execution
- **eslint**: Code linting
- **prettier**: Code formatting
- **swagger-jsdoc**: OpenAPI documentation
- **swagger-ui-express**: Documentation UI

## 🤝 Contributing

1. Follow TypeScript strict mode
2. Use ESLint and Prettier for code quality
3. Add proper JSDoc comments
4. Include Swagger documentation for endpoints
5. Write tests for new features
6. Validate with `npm run quality` before commit

## 📄 License

Internal proprietary software for Stack system.
