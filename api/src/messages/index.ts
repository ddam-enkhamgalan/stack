import { readFileSync } from 'fs';

// Define the message structure type
interface MessageStructure {
  api: {
    success: {
      users: {
        retrieved: string;
        created: string;
        fetched: string;
      };
    };
    errors: {
      validation: {
        invalidUserId: string;
        userNotFound: string;
        nameRequired: string;
        emailRequired: string;
        emailExists: string;
      };
      http: {
        notFound: string;
        notFoundDescription: string;
        rateLimitExceeded: string;
      };
    };
  };
  health: {
    status: {
      ok: string;
      error: string;
    };
  };
}

function loadMessages(language = 'en'): MessageStructure {
  try {
    // Use more robust path resolution for built files
    const messagesPath = new URL(`${language}.json`, import.meta.url).pathname;
    const messagesContent = readFileSync(messagesPath, 'utf-8');
    return JSON.parse(messagesContent) as MessageStructure;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`Failed to load messages for language '${language}':`, error);

    // Try to load English as fallback
    if (language !== 'en') {
      try {
        const fallbackPath = new URL('en.json', import.meta.url).pathname;
        const fallbackContent = readFileSync(fallbackPath, 'utf-8');
        return JSON.parse(fallbackContent) as MessageStructure;
      } catch (fallbackError) {
        // eslint-disable-next-line no-console
        console.error('Failed to load fallback messages:', fallbackError);
      }
    }

    // Final fallback to hardcoded messages
    return {
      api: {
        success: {
          users: {
            retrieved: 'Users retrieved successfully',
            created: 'User created successfully',
            fetched: 'User retrieved successfully',
          },
        },
        errors: {
          validation: {
            invalidUserId: 'Invalid user ID',
            userNotFound: 'User not found',
            nameRequired: 'Name is required and must be a non-empty string',
            emailRequired: 'Valid email is required',
            emailExists: 'User with this email already exists',
          },
          http: {
            notFound: 'Not Found',
            notFoundDescription: 'The requested resource was not found',
            rateLimitExceeded:
              'Too many requests from this IP, please try again later.',
          },
        },
      },
      health: {
        status: {
          ok: 'OK',
          error: 'ERROR',
        },
      },
    };
  }
}

// Load messages based on environment variable or default to English
const defaultLanguage = process.env.API_LANGUAGE ?? 'en';
const messages = loadMessages(defaultLanguage);

// Export commonly used messages for convenience
export const ApiMessages = {
  success: {
    users: {
      retrieved: (): string => messages.api.success.users.retrieved,
      created: (): string => messages.api.success.users.created,
      fetched: (): string => messages.api.success.users.fetched,
    },
  },
  errors: {
    validation: {
      invalidUserId: (): string => messages.api.errors.validation.invalidUserId,
      userNotFound: (): string => messages.api.errors.validation.userNotFound,
      nameRequired: (): string => messages.api.errors.validation.nameRequired,
      emailRequired: (): string => messages.api.errors.validation.emailRequired,
      emailExists: (): string => messages.api.errors.validation.emailExists,
    },
    http: {
      notFound: (): string => messages.api.errors.http.notFound,
      notFoundDescription: (): string =>
        messages.api.errors.http.notFoundDescription,
      rateLimitExceeded: (): string =>
        messages.api.errors.http.rateLimitExceeded,
    },
  },
};

export const HealthMessages = {
  status: {
    ok: (): string => messages.health.status.ok,
    error: (): string => messages.health.status.error,
  },
};
