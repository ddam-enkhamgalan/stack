/**
 * Services layer - Business logic and state management
 */

export { AuthService } from './auth';
export { NotificationService } from './notifications';
export { UserService } from './users';

// Re-export types for convenience
export type { Notification, NotificationOptions, NotificationType } from './notifications';
