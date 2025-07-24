/**
 * Validates if a string is a valid email address
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates if a string is not empty after trimming
 */
export const isValidString = (str: string): boolean => {
  return typeof str === 'string' && str.trim().length > 0;
};

/**
 * Safely parses an integer from a string
 */
export const parseIntSafe = (value: string): number | null => {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
};

/**
 * Validates if a string is a valid UUID v4
 */
export const isValidUuid = (uuid: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Creates a standardized API response
 */
export const createApiResponse = <T>(
  data?: T,
  message?: string,
  count?: number
): { data?: T; message?: string; count?: number } => {
  const response: { data?: T; message?: string; count?: number } = {};

  if (data !== undefined) response.data = data;
  if (message) response.message = message;
  if (count !== undefined) response.count = count;

  return response;
};

/**
 * Creates a standardized error response
 */
export const createErrorResponse = (
  message: string,
  status = 500
): { error: { message: string; status: number } } => ({
  error: {
    message,
    status,
  },
});

/**
 * Centralized error logging utility
 */
export const logError = (context: string, error: unknown): void => {
  // eslint-disable-next-line no-console
  console.error(`[${context}]`, error);
};

/**
 * Centralized info logging utility for development
 */
export const logInfo = (context: string, message: string): void => {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log(`[${context}] ${message}`);
  }
};
