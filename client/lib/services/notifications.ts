/**
 * Notification service for handling user notifications
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number;
  timestamp: number;
}

export interface NotificationOptions {
  title?: string;
  duration?: number;
  persistent?: boolean;
}

/**
 * Simple notification service
 * In a real app, this would integrate with a toast library or notification system
 */
export class NotificationService {
  private static notifications: Notification[] = [];
  private static listeners: Array<(notifications: Notification[]) => void> = [];

  /**
   * Show a success notification
   */
  static success(message: string, options?: NotificationOptions): string {
    return this.addNotification('success', message, options);
  }

  /**
   * Show an error notification
   */
  static error(message: string, options?: NotificationOptions): string {
    return this.addNotification('error', message, options);
  }

  /**
   * Show a warning notification
   */
  static warning(message: string, options?: NotificationOptions): string {
    return this.addNotification('warning', message, options);
  }

  /**
   * Show an info notification
   */
  static info(message: string, options?: NotificationOptions): string {
    return this.addNotification('info', message, options);
  }

  /**
   * Add a notification
   */
  private static addNotification(type: NotificationType, message: string, options?: NotificationOptions): string {
    const notification: Notification = {
      id: this.generateId(),
      type,
      message,
      title: options?.title,
      duration: options?.duration ?? (type === 'error' ? 0 : 5000), // Error notifications stay until dismissed
      timestamp: Date.now(),
    };

    this.notifications.unshift(notification);
    this.notifyListeners();

    // Auto-remove notification if duration is set
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, notification.duration);
    }

    return notification.id;
  }

  /**
   * Remove a notification by ID
   */
  static removeNotification(id: string): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.notifyListeners();
  }

  /**
   * Clear all notifications
   */
  static clear(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  /**
   * Get all current notifications
   */
  static getNotifications(): Notification[] {
    return [...this.notifications];
  }

  /**
   * Subscribe to notification changes
   */
  static subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notify all listeners of changes
   */
  private static notifyListeners(): void {
    this.listeners.forEach((listener) => {
      listener([...this.notifications]);
    });
  }

  /**
   * Generate a unique ID for notifications
   */
  private static generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Show notification for API errors
   */
  static handleApiError(error: unknown, fallbackMessage = 'An error occurred'): void {
    let message = fallbackMessage;

    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }

    this.error(message, { title: 'Error' });
  }

  /**
   * Show notification for API success
   */
  static handleApiSuccess(message: string, title?: string): void {
    this.success(message, { title });
  }
}
