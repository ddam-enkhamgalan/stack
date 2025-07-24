# Stack Client Application

Next.js 15 frontend application with modern architecture, NextAuth.js authentication, and comprehensive TypeScript support.

> 📚 **Main Documentation**: See the [project documentation](../docs/README.md) for comprehensive guides.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables (copy from .env.example)
cp .env.example .env.local

# Start development server
npm run dev
```

**Client Available at**: `http://localhost:4000`  
**API Integration**: Connects to API at `http://localhost:3000`

## 📁 New Architecture (After Code Splitting)

```
client/
├── app/                   # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   └── ui/                # Reusable UI components
└── lib/                   # Client utilities (NEW ARCHITECTURE)
    ├── api/               # API communication layer
    │   ├── http-client.ts # HTTP client with retry logic
    │   ├── auth.ts        # Authentication API functions
    │   ├── users.ts       # User management API functions
    │   └── index.ts       # API exports
    ├── services/          # Business logic layer
    │   ├── auth.ts        # Authentication service
    │   ├── users.ts       # User management service
    │   ├── notifications.ts # Notification system
    │   └── index.ts       # Services exports
    ├── types/             # TypeScript definitions
    │   └── index.ts       # All application types
    ├── constants/         # Application constants
    │   └── index.ts       # API endpoints, configs
    ├── utils.ts           # Utility functions
    └── README.md          # Library architecture guide
```

## 🔧 Available Scripts

```bash
npm run dev          # Start Next.js development server
npm run build        # Build production bundle
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript compilation check
```

## 🔒 Authentication System

### NextAuth.js v5 Integration

- **JWT Tokens** with automatic refresh
- **Session Management** with persistent storage
- **Route Protection** with auth guards
- **API Integration** with backend authentication

### Authentication Flow

```typescript
// Using the new service layer
import { AuthService } from '@/lib/services';

// Login
const user = await AuthService.login({ email, password });

// Check authentication
const isAuthenticated = AuthService.isAuthenticated();

// Auto token refresh (handled automatically)
```

### Key Features

- ✅ **Automatic Token Refresh**: Seamless session management
- ✅ **Protected Routes**: Auth guards for secure pages
- ✅ **Role-Based Access**: Admin and user permissions
- ✅ **Error Handling**: User-friendly error messages
- ✅ **Persistent Sessions**: Survives browser restarts

## 🏗️ New Library Architecture

### API Layer (`/lib/api`)

- **HTTP Client**: Axios-based client with retry logic and error handling
- **Authentication APIs**: Login, register, refresh, logout endpoints
- **User APIs**: CRUD operations for user management
- **Response Handling**: Standardized API response processing

### Services Layer (`/lib/services`)

- **AuthService**: Authentication business logic and state management
- **UserService**: User management operations
- **NotificationService**: Toast notifications and user feedback
- **localStorage Integration**: Session persistence and token management

### Types Layer (`/lib/types`)

- **API Types**: Request/response interfaces
- **Component Types**: Props and state definitions
- **Form Types**: Form data and validation schemas
- **Auth Types**: User and session type definitions

### Constants Layer (`/lib/constants`)

- **API Endpoints**: Centralized endpoint definitions
- **Error Messages**: User-facing error messages
- **Validation Rules**: Form validation patterns
- **Configuration**: App-wide settings and defaults

## 📱 UI Components

Built with modern React patterns and Tailwind CSS:

```
components/ui/
├── button.tsx       # Reusable button component
├── input.tsx        # Form input component
├── textarea.tsx     # Text area component
└── badge.tsx        # Status badge component
```

### Usage Examples

```typescript
// Using the new architecture
import { AuthService, NotificationService } from '@/lib/services';
import { Button } from '@/components/ui/button';

// In a component
const handleLogin = async (formData) => {
  try {
    await AuthService.login(formData);
    NotificationService.success('Login successful!');
  } catch (error) {
    NotificationService.handleApiError(error);
  }
};
```

## 🎨 Styling

- **Tailwind CSS**: Utility-first CSS framework
- **CSS Variables**: Consistent theming system
- **Responsive Design**: Mobile-first approach
- **Component Variants**: Flexible component styling

## 🧪 Development Workflow

### Best Practices

1. **Use Services Layer**: Avoid direct API calls in components
2. **Type Everything**: Leverage TypeScript for better DX
3. **Centralized Constants**: Use constants for URLs and messages
4. **Error Handling**: Use NotificationService for user feedback

### Component Development

```typescript
// Good: Using services
import { UserService } from '@/lib/services';

// Avoid: Direct API calls
import { fetch } from 'some-http-client';
```

## 🔗 Related Documentation

- **[Main Documentation](../docs/README.md)** - Project overview and guides
- **[Architecture Guide](../ARCHITECTURE.md)** - Detailed architectural documentation
- **[Library README](lib/README.md)** - Client library architecture details
- **[Authentication Guide](../docs/authentication.md)** - Auth system documentation
- **[Development Guide](../docs/DEVELOPMENT.md)** - Development setup and workflows

## 🚨 Troubleshooting

### Common Issues

**Build Errors**

```bash
# Check TypeScript compilation
npm run type-check

# Fix linting issues
npm run lint --fix
```

**Authentication Issues**

```bash
# Check environment variables
cat .env.local

# Verify API connection
curl http://localhost:3000/health
```

**Port Conflicts**

```bash
# Check what's using port 4000
lsof -i :4000

# Use different port
npm run dev -- -p 3001
```

### Environment Variables

```bash
# Required variables
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:4000
NEXTAUTH_SECRET=your-secret-key
```

---

For comprehensive documentation and deployment instructions, see the [main project documentation](../docs/README.md).

1. User visits protected route
2. Auth guard checks authentication status
3. Redirects to sign-in page if not authenticated
4. User enters credentials
5. Credentials validated against Stack API
6. JWT tokens stored in session
7. User redirected to requested page

### Auth Components

#### `AuthProvider`

Session provider wrapper for the entire application:

```tsx
import { AuthProvider } from '@/components/auth-provider';

<AuthProvider>
  <App />
</AuthProvider>;
```

#### `AuthGuard`

Component-level route protection:

```tsx
import { AuthGuard } from '@/components/auth-guard';

<AuthGuard requiredRole="admin">
  <AdminPanel />
</AuthGuard>;
```

#### `useAuthGuard` Hook

Hook for authentication logic in components:

```tsx
import { useAuthGuard } from '@/hooks/use-auth-guard';

function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuthGuard();

  if (isLoading) return <Loading />;
  if (!isAuthenticated) return null;

  return <DashboardContent user={user} />;
}
```

## 📁 Project Structure

```
app/
├── api/
│   └── auth/
│       └── [...nextauth]/    # NextAuth.js API routes
├── auth/
│   ├── signin/              # Sign-in page
│   └── error/               # Auth error page
├── dashboard/               # Protected dashboard
├── admin/                   # Admin-only page
├── unauthorized/            # Access denied page
├── layout.tsx              # Root layout with AuthProvider
├── page.tsx               # Home page with navigation
└── globals.css            # Global styles

components/
├── ui/                    # Reusable UI components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── label.tsx
│   └── alert.tsx
├── auth-provider.tsx      # NextAuth session provider
└── auth-guard.tsx        # Route protection component

hooks/
└── use-auth-guard.ts     # Authentication guard hook

lib/
├── auth.ts              # NextAuth configuration
└── utils.ts            # Utility functions

types/
└── next-auth.d.ts      # NextAuth TypeScript definitions
```

## 🛡️ Route Protection

### Public Routes

- `/` - Home page
- `/auth/signin` - Sign-in page
- `/auth/error` - Authentication error page

### Protected Routes

- `/dashboard` - Requires authentication
- `/admin` - Requires admin role
- `/unauthorized` - Access denied page

### Implementation Examples

#### Component-Level Protection

```tsx
import { AuthGuard } from '@/components/auth-guard';

export default function ProtectedPage() {
  return (
    <AuthGuard>
      <YourContent />
    </AuthGuard>
  );
}
```

#### Hook-Based Protection

```tsx
import { useAuthGuard } from '@/hooks/use-auth-guard';

export default function Dashboard() {
  const { user, isLoading } = useAuthGuard();

  if (isLoading) return <div>Loading...</div>;

  return <div>Welcome {user?.name}!</div>;
}
```

#### Role-Based Protection

```tsx
import { AuthGuard } from '@/components/auth-guard';

export default function AdminPage() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminPanel />
    </AuthGuard>
  );
}
```

## 🔧 Configuration

### Environment Variables

```bash
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:4000
NEXTAUTH_SECRET=your-nextauth-secret-change-this-in-production

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

### NextAuth.js Setup

The authentication is configured in `/lib/auth.ts`:

- **Provider**: Credentials provider connecting to Stack API
- **JWT Strategy**: Token-based sessions with automatic refresh
- **Custom Pages**: Custom sign-in and error pages
- **Callbacks**: Session and JWT token handling

## 🎨 UI Components

Built with Tailwind CSS and shadcn/ui components:

- **Button** - Interactive buttons with variants
- **Card** - Content containers with headers and descriptions
- **Input** - Form input fields
- **Label** - Form labels
- **Alert** - Status and error messages

## 🧪 Testing Authentication

### Demo Credentials

```
Email: amgaa.lcs@gmail.com
Password: qwertyQ123!
Role: admin
```

### Test Scenarios

1. **Sign In Flow**
   - Visit `/auth/signin`
   - Enter demo credentials
   - Verify redirect to dashboard

2. **Route Protection**
   - Visit `/dashboard` without authentication
   - Verify redirect to sign-in page
   - Sign in and verify access granted

3. **Role Protection**
   - Sign in with admin user
   - Visit `/admin` page
   - Verify admin access granted

4. **Session Management**
   - Sign in and wait for token expiry
   - Verify automatic token refresh
   - Test sign out functionality

## 🚀 Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run lintfix         # Fix linting issues and format

# Type Checking
npx tsc --noEmit        # Check TypeScript types
```

## 📚 API Integration

### Authentication Endpoints

The client integrates with these Stack API endpoints:

- `POST /api/auth/login` - User authentication
- `POST /api/auth/refresh` - Token refresh
- `GET /api/auth/profile` - Get user profile

### API Client Example

```typescript
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password',
  }),
});

const data = await response.json();
```

## 🔍 Troubleshooting

### Common Issues

1. **NextAuth.js Configuration Error**
   - Verify `NEXTAUTH_SECRET` is set
   - Check `NEXTAUTH_URL` matches your domain

2. **API Connection Issues**
   - Verify `NEXT_PUBLIC_API_URL` points to running API server
   - Check CORS configuration on API server

3. **Type Errors**
   - Ensure `types/next-auth.d.ts` is properly configured
   - Restart TypeScript server in VS Code

4. **Session Issues**
   - Clear browser cookies and localStorage
   - Verify JWT secret matches between client and API

### Debug Mode

Enable NextAuth.js debugging:

```bash
NODE_ENV=development
```

This will show detailed authentication logs in the console.

## 📄 License

Internal proprietary software for Stack system.
