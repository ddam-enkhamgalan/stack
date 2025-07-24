# API Documentation

The Stack API is a modern Express.js 5.1 application with JWT authentication, built with TypeScript and providing a robust backend for anything.

## 🚀 Overview

### Features
- **Express.js 5.1**: Latest stable version with enhanced performance
- **TypeScript**: Full type safety and modern JavaScript features
- **JWT Authentication**: Secure token-based authentication with bcrypt password hashing
- **User CRUD**: Complete user management with protected endpoints
- **Security**: Comprehensive security middleware (Helmet, CORS, Rate limiting)
- **Documentation**: Auto-generated OpenAPI 3.0 with Swagger UI and JWT support
- **Validation**: Input validation with custom validators
- **Internationalization**: Multi-language support (EN, MN, JA)
- **Database**: PostgreSQL integration with connection pooling
- **Monitoring**: Request logging and error tracking

### Base URL
```
Development: http://localhost:3000
Production: [Your production URL]
```

### Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │    │   Express API   │    │   PostgreSQL    │
│   (Next.js)     │◄──►│   (Port 3000)   │◄──►│   Database      │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │ AWS Services    │
                       │ (Secrets Mgr)   │
                       └─────────────────┘
```

## 📁 Project Structure

```
api/
├── src/
│   ├── config/           # Configuration files
│   │   └── swagger.ts    # OpenAPI/Swagger configuration
│   ├── middleware/       # Express middleware
│   │   ├── errorHandler.ts  # Global error handling
│   │   └── logger.ts     # Request logging
│   ├── routes/          # API route definitions
│   │   ├── index.ts     # Main router
│   │   └── userRoutes.ts    # User management routes
│   ├── scripts/         # Utility scripts
│   │   ├── generateOpenApiSchema.ts
│   │   ├── serveOpenApiDocs.ts
│   │   └── validateOpenApiSchema.ts
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts     # Common types
│   ├── utils/           # Utility functions
│   │   ├── database.ts  # Database connection and utilities
│   │   └── helpers.ts   # Helper functions
│   ├── messages/        # Internationalization
│   │   ├── en.json      # English messages
│   │   ├── mn.json      # Mongolian messages
│   │   ├── ja.json      # Japanese messages
│   │   └── index.ts     # Message loader
│   └── index.ts         # Application entry point
├── scripts/             # Database and development scripts
│   ├── init-database.ts # Database initialization
│   └── test-messages.ts # Message system testing
├── docs/               # API-specific documentation
│   ├── MESSAGES.md     # Internationalization guide
│   └── OPENAPI_GUIDE.md # OpenAPI schema guide
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── eslint.config.js    # ESLint configuration
└── .env.example        # Environment variable template
```

## � Authentication System

### JWT Authentication
The API uses JSON Web Tokens (JWT) for secure authentication:

- **Algorithm**: HS256
- **Access Token Expiry**: 24 hours (configurable)
- **Refresh Token Expiry**: 7 days (configurable)
- **Password Hashing**: bcrypt with 12 rounds (configurable)

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecureP@ss123"
}
```

**Response (201):**
```json
{
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2025-07-23T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecureP@ss123"
}
```

**Response (200):** Same as registration

#### Get Current User Profile
```http
GET /api/auth/me
Authorization: Bearer <your-jwt-token>
```

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2025-07-23T12:00:00.000Z"
  },
  "message": "User profile retrieved successfully"
}
```

### Password Requirements
- Minimum 8 characters
- Must contain uppercase letter
- Must contain lowercase letter  
- Must contain number
- Must contain special character (@$!%*?&)

## �🔧 Getting Started

### Prerequisites
- Node.js 20+ installed
- PostgreSQL 16 (local or Docker)
- npm or yarn package manager

### Installation

1. **Install Dependencies**
   ```bash
   cd api
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your database configuration
   ```

3. **Database Setup**
   ```bash
   # Start PostgreSQL (if using Docker)
   cd ../docker
   docker-compose up postgres
   
   # Initialize database schema
   cd ../api
   npm run db:init
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

### Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload
npm run build           # Build TypeScript to JavaScript
npm run start           # Start production server

# Database
npm run db:init         # Initialize database schema
npm run db:migrate      # Run database migrations

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues automatically
npm run format          # Format code with Prettier
npm run type-check      # Check TypeScript types

# Documentation
npm run docs:generate   # Generate OpenAPI schema
npm run docs:serve      # Serve API documentation
npm run docs:validate   # Validate OpenAPI schema

# Testing
npm run test:messages   # Test internationalization
```

## 🌐 API Endpoints

### Base URL
- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com/api`

### Health Check
```
GET /health
```
Returns API health status and system information.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-23T12:00:00Z",
  "version": "1.0.0",
  "environment": "development"
}
```

### User Management

> **Note**: User creation is now handled through the `/api/auth/register` endpoint. The user management endpoints focus on reading, updating, and deleting existing users.

#### Get All Users
```http
GET /api/users
```

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2025-07-23T12:00:00.000Z",
      "updatedAt": "2025-07-23T12:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Jane Smith", 
      "email": "jane@example.com",
      "createdAt": "2025-07-23T12:00:00.000Z",
      "updatedAt": "2025-07-23T12:00:00.000Z"
    }
  ],
  "message": "Users retrieved successfully",
  "count": 2
}
```

#### Get User by ID
```http
GET /api/users/{id}
```

**Parameters:**
- `id` (integer, required): User ID

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2025-07-23T12:00:00.000Z",
    "updatedAt": "2025-07-23T12:00:00.000Z"
  },
  "message": "User retrieved successfully"
}
```

#### Update User (Protected)
```http
PUT /api/users/{id}
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "updated@example.com",
  "password": "NewSecureP@ss123"
}
```

**Access Control:** Users can only update their own profile.

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "name": "Updated Name",
    "email": "updated@example.com",
    "createdAt": "2025-07-23T12:00:00.000Z",
    "updatedAt": "2025-07-23T12:30:00.000Z"
  },
  "message": "User updated successfully"
}
```

#### Delete User (Protected)
```http
DELETE /api/users/{id}
Authorization: Bearer <your-jwt-token>
```

**Access Control:** Users can only delete their own profile.

**Response (200):**
```json
{
  "data": {
    "deleted": true
  },
  "message": "User deleted successfully"
}
```
GET /api/users/:id
```

#### Update User
```
PUT /api/users/:id
Content-Type: application/json
```

#### Delete User
```
DELETE /api/users/:id
```

### Documentation Endpoints

#### OpenAPI Specification
```
GET /api-docs/openapi.json    # JSON format
GET /api-docs/openapi.yaml    # YAML format
```

#### Swagger UI
```
GET /api-docs                 # Interactive API documentation
```

## 🛡️ Security Features

### Middleware Stack
1. **Helmet**: Security headers
2. **CORS**: Cross-origin resource sharing
3. **Rate Limiting**: Request throttling
4. **Input Validation**: Request validation
5. **Error Handling**: Secure error responses

### Authentication & Authorization
Currently implemented as a foundation for:
- JWT token authentication
- Role-based access control (RBAC)
- Session management
- Password hashing with bcrypt

### Environment Variables Security
```bash
# Database (use AWS Secrets Manager in production)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stack
DB_USER=your_username
DB_PASSWORD=your_password

# API Configuration
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:4000
API_LANGUAGE=en

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🌍 Internationalization

The API supports multiple languages through JSON-based message files:

### Supported Languages
- **English (en)** - Default
- **Mongolian (mn)** - Cyrillic script
- **Japanese (ja)** - Hiragana/Katakana/Kanji

### Usage
```typescript
import { getMessage } from './messages';

// Use in route handlers
app.get('/api/users', (req, res) => {
  res.json({
    message: getMessage('users.retrieved'),
    data: users
  });
});
```

### Language Selection
Set the `API_LANGUAGE` environment variable:
```bash
API_LANGUAGE=en    # English
API_LANGUAGE=mn    # Mongolian  
API_LANGUAGE=ja    # Japanese
```

## 📊 Database Integration

### Connection Management
```typescript
// Connection pool configuration
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  min: 2,
  max: 10,
  idleTimeoutMillis: 30000,
});
```

### AWS Secrets Manager Integration
```typescript
// Production database credentials
const secret = await secretsManager.getSecretValue({
  SecretId: process.env.DB_SECRET_ARN
}).promise();

const credentials = JSON.parse(secret.SecretString!);
```

## 📝 Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "value": "invalid-email",
      "message": "Must be a valid email address"
    }
  },
  "timestamp": "2025-01-23T12:00:00Z",
  "path": "/api/users"
}
```

### Error Types
- **400 Bad Request**: Validation errors
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server errors

## 📈 Monitoring & Logging

### Request Logging
All requests are logged with:
- Timestamp
- HTTP method and path
- Response status and time
- User agent and IP address
- Request/response size

### Health Monitoring
```typescript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
```

### Error Tracking
- Structured error logging
- Stack trace capture (development only)
- Error categorization and counting
- Integration ready for services like Sentry

## 🚀 Deployment

### Docker Container
```bash
# Build container
docker build -f docker/api.Dockerfile -t stack-api .

# Run container
docker run -p 3000:3000 --env-file .env stack-api
```

### AWS ECS Deployment
The API is configured to run on AWS ECS Fargate with:
- Auto-scaling based on CPU/memory usage
- Load balancer integration
- CloudWatch logging
- Secrets Manager integration

### Environment Variables for Production
```bash
NODE_ENV=production
DB_SECRET_ARN=arn:aws:secretsmanager:region:account:secret:name
AWS_REGION=us-east-1
PORT=3000
```

## 🧪 Testing

### Manual Testing
```bash
# Test health endpoint
curl http://localhost:3000/health

# Test user creation
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"test","password":"password123"}'
```

### Message System Testing
```bash
# Test all languages
npm run test:messages

# Test specific language
API_LANGUAGE=mn npm run test:messages
```

## 📚 Additional Resources

- **[Database Guide](../docs/DATABASE.md)** - Database setup and schema
- **[Deployment Guide](../docs/DEPLOYMENT.md)** - AWS deployment instructions
- **[OpenAPI Guide](./docs/OPENAPI_GUIDE.md)** - API schema documentation
- **[Messages Guide](./docs/MESSAGES.md)** - Internationalization details
