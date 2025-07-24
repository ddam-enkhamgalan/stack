# Authentication System

## Overview

The Stack API implements a comprehensive JWT-based authentication system with automatic token refresh functionality. The system supports both access tokens (short-lived) and refresh tokens (long-lived) to provide security and user convenience.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   NextAuth.js   │    │   Express API   │    │   PostgreSQL    │
│   (Frontend)    │    │   (Backend)     │    │   (Database)    │
│                 │    │                 │    │                 │
│ - Session Mgmt  │◄──►│ - JWT Auth      │◄──►│ - User Storage  │
│ - Auto Refresh  │    │ - Token Refresh │    │ - Auth History  │
│ - Token Storage │    │ - Route Guards  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Token System

### Access Tokens
- **Purpose**: Authorize API requests
- **Lifetime**: 15 minutes (configurable)
- **Storage**: Memory/HTTP-only cookies
- **Usage**: Included in Authorization header

### Refresh Tokens
- **Purpose**: Generate new access tokens
- **Lifetime**: 7 days (configurable)
- **Storage**: HTTP-only cookies (secure)
- **Usage**: Automatic refresh when access token expires

## API Endpoints

### POST /api/auth/register

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecureP@ss123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2025-07-24T10:00:00Z",
      "updatedAt": "2025-07-24T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /api/auth/login

Authenticate user with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecureP@ss123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2025-07-24T10:00:00Z",
      "updatedAt": "2025-07-24T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /api/auth/refresh

Get a new access token using a refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### GET /api/auth/me

Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2025-07-24T10:00:00Z",
    "updatedAt": "2025-07-24T10:00:00Z"
  }
}
```

## Frontend Integration (NextAuth.js)

### Configuration

```typescript
// lib/auth.ts
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const res = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        })
        
        if (res.ok) {
          const data = await res.json()
          return {
            id: data.data.user.id,
            name: data.data.user.name,
            email: data.data.user.email,
            accessToken: data.data.token,
            refreshToken: data.data.refreshToken
          }
        }
        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
        token.accessTokenExpires = Date.now() + 15 * 60 * 1000 // 15 minutes
      }

      // Check if access token needs refresh
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token
      }

      // Refresh the access token
      return refreshAccessToken(token)
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      return session
    }
  }
})

async function refreshAccessToken(token: any) {
  try {
    const response = await fetch('http://localhost:3000/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: token.refreshToken })
    })

    const refreshedTokens = await response.json()

    if (!response.ok) throw refreshedTokens

    return {
      ...token,
      accessToken: refreshedTokens.data.accessToken,
      accessTokenExpires: Date.now() + 15 * 60 * 1000
    }
  } catch (error) {
    return { ...token, error: 'RefreshAccessTokenError' }
  }
}
```

### Usage in Components

```typescript
// app/page.tsx
import { auth } from '@/lib/auth'
import { SignInButton, SignOutButton } from '@/components/auth-buttons'

export default async function Page() {
  const session = await auth()
  
  return (
    <div>
      {session ? (
        <div>
          <p>Welcome, {session.user?.name}!</p>
          <SignOutButton />
        </div>
      ) : (
        <SignInButton />
      )}
    </div>
  )
}
```

### Client-Side Usage

```typescript
// components/profile.tsx
'use client'
import { useSession } from 'next-auth/react'

export function Profile() {
  const { data: session, status } = useSession()
  
  if (status === 'loading') return <p>Loading...</p>
  if (status === 'unauthenticated') return <p>Please sign in</p>
  
  return <p>Welcome, {session?.user?.name}!</p>
}
```

## Backend Implementation

### Service Layer

```typescript
// services/authService.ts
export class AuthService {
  static async login(email: string, password: string): Promise<AuthResponse> {
    // Input validation
    if (!isValidEmail(email)) {
      throw new Error('Valid email is required')
    }

    // Get user with password hash
    const user = await AuthOperations.getUserByEmailForAuth(email)
    if (!user) {
      throw new Error('Invalid credentials')
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash)
    if (!isPasswordValid) {
      throw new Error('Invalid credentials')
    }

    // Generate tokens
    const token = generateToken(user)
    const refreshToken = generateRefreshToken(user)

    return { user, token, refreshToken }
  }
}
```

### Middleware

```typescript
// middleware/auth.ts
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization
  const token = authHeader?.split(' ')[1]

  if (!token) {
    res.status(401).json(createErrorResponse('Access token required', 401))
    return
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    req.user = decoded as User
    next()
  } catch (error) {
    res.status(403).json(createErrorResponse('Invalid or expired token', 403))
  }
}
```

## Security Features

### Password Hashing
- Uses bcrypt with salt rounds (default: 12)
- Passwords are never stored in plain text
- Password strength validation

### Token Security
- JWT tokens signed with strong secrets
- Separate secrets for access and refresh tokens
- Configurable token expiration times

### Rate Limiting
- Login attempt limiting
- API rate limiting by IP address
- Exponential backoff for failed attempts

### Input Validation
- Email format validation
- Password strength requirements
- SQL injection prevention
- XSS protection

## Environment Variables

```bash
# JWT Configuration
JWT_SECRET=your-super-secure-access-token-secret
JWT_REFRESH_SECRET=your-super-secure-refresh-token-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# NextAuth Configuration (Frontend)
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# API Configuration
API_URL=http://localhost:3000
```

## Error Handling

### Common Error Responses

```json
// Invalid credentials
{
  "success": false,
  "error": {
    "message": "Invalid email or password",
    "status": 401
  }
}

// Expired token
{
  "success": false,
  "error": {
    "message": "Token has expired",
    "status": 403
  }
}

// Validation error
{
  "success": false,
  "error": {
    "message": "Valid email is required",
    "status": 400
  }
}
```

## Testing

### Unit Tests

```typescript
// tests/auth.test.ts
describe('AuthService', () => {
  it('should login user with valid credentials', async () => {
    const result = await AuthService.login('john@example.com', 'password123')
    expect(result.user.email).toBe('john@example.com')
    expect(result.token).toBeDefined()
    expect(result.refreshToken).toBeDefined()
  })

  it('should reject invalid credentials', async () => {
    await expect(
      AuthService.login('john@example.com', 'wrongpassword')
    ).rejects.toThrow('Invalid credentials')
  })
})
```

### Integration Tests

```typescript
// tests/auth-routes.test.ts
describe('Auth Routes', () => {
  it('POST /api/auth/login should return tokens', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john@example.com', password: 'password123' })
      .expect(200)

    expect(response.body.data.token).toBeDefined()
    expect(response.body.data.refreshToken).toBeDefined()
  })
})
```

## Best Practices

### Security
1. **Never log sensitive data** (passwords, tokens)
2. **Use HTTPS in production**
3. **Rotate JWT secrets regularly**
4. **Implement proper CORS policies**
5. **Use secure cookie settings**

### Performance
1. **Cache user data appropriately**
2. **Use database indexes for auth queries**
3. **Implement connection pooling**
4. **Monitor token refresh rates**

### Monitoring
1. **Log authentication events**
2. **Monitor failed login attempts**
3. **Track token usage patterns**
4. **Set up alerts for suspicious activity**

This authentication system provides a robust, secure, and user-friendly foundation for the Stack application, with automatic token refresh ensuring seamless user experience while maintaining security best practices.
