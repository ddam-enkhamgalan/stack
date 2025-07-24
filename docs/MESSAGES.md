# Messages System Documentation

## Overview

The Stack API uses a JSON-based internationalization system for all user-facing messages. Instead of storing messages in environment variables, they are organized in JSON files within the `src/messages/` directory.

## Structure

```
src/messages/
├── index.ts    # TypeScript module that loads and exports messages
├── en.json     # English messages (default)
├── mn.json     # Mongolian messages
└── ja.json     # Japanese messages
```

## Configuration

The API language is controlled by the `API_LANGUAGE` environment variable:

```bash
# Set the API language (default: en)
API_LANGUAGE=en    # English
API_LANGUAGE=mn    # Mongolian
API_LANGUAGE=ja    # Japanese
```

## Message Structure

All language files follow the same JSON structure:

```json
{
  "api": {
    "success": {
      "users": {
        "retrieved": "Users retrieved successfully",
        "created": "User created successfully",
        "fetched": "User retrieved successfully"
      }
    },
    "errors": {
      "validation": {
        "invalidUserId": "Invalid user ID",
        "userNotFound": "User not found",
        "nameRequired": "Name is required and must be a non-empty string",
        "emailRequired": "Valid email is required",
        "emailExists": "User with this email already exists"
      },
      "http": {
        "notFound": "Not Found",
        "notFoundDescription": "The requested resource was not found",
        "rateLimitExceeded": "Too many requests from this IP, please try again later."
      }
    }
  },
  "health": {
    "status": {
      "ok": "OK",
      "error": "ERROR"
    }
  }
}
```

## Usage in Code

Import and use messages in your TypeScript code:

```typescript
import { ApiMessages, HealthMessages } from '../messages/index.js';

// Success messages
const message = ApiMessages.success.users.retrieved();

// Error messages
const error = ApiMessages.errors.validation.userNotFound();

// Health messages
const status = HealthMessages.status.ok();
```

## Adding New Messages

1. **Add to JSON files**: Update all language files with the new message
2. **Update TypeScript interface**: Modify the `MessageStructure` interface in `src/messages/index.ts`
3. **Export convenience functions**: Add corresponding functions to the exported objects

Example:

```typescript
// In MessageStructure interface
interface MessageStructure {
  api: {
    success: {
      users: {
        // ... existing messages
        updated: string; // Add new message
      };
    };
  };
}

// In exported objects
export const ApiMessages = {
  success: {
    users: {
      // ... existing functions
      updated: (): string => messages.api.success.users.updated,
    },
  },
};
```

## Adding New Languages

1. **Create language file**: Add a new JSON file (e.g., `fr.json` for French)
2. **Translate all messages**: Ensure all message keys match the existing structure
3. **Update documentation**: Add the new language code to this documentation

Example for French:

```json
// src/messages/fr.json
{
  "api": {
    "success": {
      "users": {
        "retrieved": "Utilisateurs récupérés avec succès",
        "created": "Utilisateur créé avec succès",
        "fetched": "Utilisateur récupéré avec succès"
      }
    },
    // ... translate all other messages
  }
}
```

## Fallback Behavior

The messages system includes robust fallback handling:

1. **Primary**: Load the specified language (e.g., `mn.json`)
2. **Fallback**: If primary fails, load English (`en.json`)
3. **Last resort**: If all files fail, use hardcoded English messages

## Benefits

- **Maintainability**: All messages centralized in JSON files
- **Type Safety**: TypeScript interfaces ensure message structure consistency
- **Internationalization**: Easy to add new languages
- **Performance**: Messages loaded once at startup
- **Fallback**: Graceful handling of missing language files
- **Development**: Clear separation from configuration variables

## Available Languages

| Code | Language | File |
|------|----------|------|
| `en` | English | `en.json` |
| `mn` | Mongolian | `mn.json` |
| `ja` | Japanese | `ja.json` |

## Best Practices

1. **Always use functions**: Access messages through the exported functions, not directly
2. **Keep structure consistent**: Ensure all language files have the same structure
3. **Use descriptive keys**: Message keys should be self-explanatory
4. **Test fallbacks**: Verify behavior with missing or invalid language files
5. **Update all languages**: When adding new messages, update all language files
