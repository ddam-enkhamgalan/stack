# Client Library Architecture

This directory contains the client-side architecture for the application, implementing a clean separation of concerns with multiple layers.

## Structure

```
lib/
├── api/                 # API communication layer
│   ├── http-client.ts   # HTTP client with retry logic
│   ├── auth.ts          # Authentication API functions
│   ├── users.ts         # User management API functions
│   └── index.ts         # API exports
├── services/            # Business logic layer
│   ├── auth.ts          # Authentication business logic
│   ├── users.ts         # User management logic
│   ├── notifications.ts # Notification system
│   └── index.ts         # Services exports
├── types/               # TypeScript type definitions
│   └── index.ts         # All application types
├── constants/           # Application constants
│   └── index.ts         # API endpoints, configs, etc.
├── utils.ts             # Utility functions
└── index.ts             # Main library exports
```

## Layer Responsibilities

### API Layer (`/api`)

- **Purpose**: Direct communication with backend APIs
- **Responsibilities**:
  - HTTP request/response handling
  - Request configuration and headers
  - Response parsing and error handling
  - Retry logic for failed requests
- **Key Components**:
  - `HttpClient`: Reusable HTTP client with axios
  - `ApiResponseHandler`: Standardized response processing
  - Authentication APIs, User APIs, etc.

### Services Layer (`/services`)

- **Purpose**: Business logic and state management
- **Responsibilities**:
  - Orchestrating API calls
  - Managing local storage and session state
  - Implementing business rules and validations
  - Handling authentication flows
  - Managing user data and profiles
- **Key Components**:
  - `AuthService`: Login, logout, token refresh, session management
  - `UserService`: User CRUD operations, profile management
  - `NotificationService`: User notifications and toast messages

### Types Layer (`/types`)

- **Purpose**: TypeScript type definitions for the entire application
- **Responsibilities**:
  - API request/response types
  - Component prop types
  - Form data types
  - State management types
- **Key Types**:
  - `User`, `AuthUser`: User data structures
  - `ApiResponse<T>`: Standardized API response format
  - `LoginRequest`, `RegisterRequest`: Form data types
  - `RequestConfig`: HTTP configuration types

### Constants Layer (`/constants`)

- **Purpose**: Application-wide constants and configuration
- **Responsibilities**:
  - API endpoints and base URLs
  - Error messages and status codes
  - Pagination and validation rules
  - Storage keys and default values
- **Key Constants**:
  - `API_ENDPOINTS`: All backend endpoint URLs
  - `ERROR_MESSAGES`: User-facing error messages
  - `STORAGE_KEYS`: LocalStorage key names
  - `VALIDATION_RULES`: Form validation patterns

## Usage Examples

### Authentication

```typescript
import { AuthService, NotificationService } from '@/lib/services';

// Login
try {
  const user = await AuthService.login({ email, password });
  NotificationService.success('Login successful!');
} catch (error) {
  NotificationService.handleApiError(error);
}

// Check authentication status
const isAuthenticated = AuthService.isAuthenticated();
const currentUser = AuthService.getCurrentUser();
```

### User Management

```typescript
import { UserService } from '@/lib/services';

// Get all users
const users = await UserService.getAllUsers();

// Update user profile
const updatedUser = await UserService.updateUser(userId, updateData);
```

### API Calls (Lower Level)

```typescript
import { AuthApi, UsersApi } from '@/lib/api';

// Direct API calls (typically used by services)
const authResponse = await AuthApi.login({ email, password });
const users = await UsersApi.getUsers({}, accessToken);
```

### Notifications

```typescript
import { NotificationService } from '@/lib/services';

// Show notifications
NotificationService.success('Operation completed!');
NotificationService.error('Something went wrong');
NotificationService.warning('Please check your input');

// Handle API errors automatically
NotificationService.handleApiError(error);
```

## Design Principles

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Type Safety**: Full TypeScript coverage with strict typing
3. **Error Handling**: Consistent error handling across all layers
4. **Reusability**: Components and services are highly reusable
5. **Testability**: Clean architecture makes unit testing straightforward
6. **Maintainability**: Clear structure makes code easy to modify and extend

## Integration with Components

Components should primarily interact with the **Services layer**:

```typescript
// ✅ Good - Use services
import { AuthService, NotificationService } from '@/lib/services';

// ❌ Avoid - Direct API calls in components
import { AuthApi } from '@/lib/api';
```

This architecture ensures that:

- Business logic is centralized in services
- Components remain simple and focused on UI
- API integration is consistent across the application
- Error handling and loading states are managed centrally

## Migration Guide

When updating existing components to use this architecture:

1. Replace direct API calls with service methods
2. Use centralized types from `/types`
3. Replace hardcoded URLs with constants from `/constants`
4. Use `NotificationService` for user feedback instead of custom toast implementations
5. Leverage `AuthService` for authentication state instead of custom hooks
