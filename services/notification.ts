import { supabase } from './supabase';
import { Notification, NotificationType, NotificationPreferences } from '@/types/notification';

/**
 * Service for handling notification operations
 */
export class NotificationService {
  /**
   * Get all notifications for a user
   * @param userId The user ID
   * @returns Array of notifications
   */
  static async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching notifications: ${error.message}`);
    }

    return data as Notification[];
  }

  /**
   * Get unread notification count for a user
   * @param userId The user ID
   * @returns Number of unread notifications
   */
  static async getUnreadNotificationCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      throw new Error(`Error fetching unread notification count: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Mark a notification as read
   * @param notificationId The notification ID
   * @returns The updated notification
   */
  static async markNotificationAsRead(notificationId: string): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error marking notification as read: ${error.message}`);
    }

    return data as Notification;
  }

  /**
   * Mark all notifications as read for a user
   * @param userId The user ID
   */
  static async markAllNotificationsAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      throw new Error(`Error marking all notifications as read: ${error.message}`);
    }
  }

  /**
   * Create a notification
   * @param userId The user ID
   * @param title The notification title
   * @param message The notification message
   * @param type The notification type
   * @param relatedId Optional related ID (e.g., listing ID, document ID)
   * @returns The created notification
   */
  static async createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    relatedId?: string
  ): Promise<Notification> {
    // Check user notification preferences
    const preferences = await this.getNotificationPreferences(userId);
    
    // Skip creating notification if the user has disabled this type
    if (preferences) {
      if (
        (type === 'listing_view' && !preferences.listing_view) ||
        (type === 'listing_save' && !preferences.listing_save) ||
        (type === 'connection_request' && !preferences.connection_request) ||
        (type === 'document_access_request' && !preferences.document_access_request) ||
        ((type === 'document_access_approved' || type === 'document_access_rejected') && !preferences.document_access_response) ||
        (type === 'message_received' && !preferences.message_received)
      ) {
        // Return a mock notification object without actually creating it
        return {
          id: 'skipped',
          user_id: userId,
          title,
          message,
          type,
          is_read: false,
          related_id: relatedId,
          created_at: new Date().toISOString()
        };
      }
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        is_read: false,
        related_id: relatedId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating notification: ${error.message}`);
    }

    return data as Notification;
  }

  /**
   * Get notification preferences for a user
   * @param userId The user ID
   * @returns The notification preferences or null if not found
   */
  static async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error fetching notification preferences: ${error.message}`);
    }

    return data as NotificationPreferences;
  }

  /**
   * Create or update notification preferences for a user
   * @param userId The user ID
   * @param preferences The notification preferences
   * @returns The updated notification preferences
   */
  static async updateNotificationPreferences(
    userId: string,
    preferences: Partial<Omit<NotificationPreferences, 'id' | 'user_id'>>
  ): Promise<NotificationPreferences> {
    // Check if preferences exist
    const existingPreferences = await this.getNotificationPreferences(userId);

    if (existingPreferences) {
      // Update existing preferences
      const { data, error } = await supabase
        .from('notification_preferences')
        .update(preferences)
        .eq('id', existingPreferences.id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating notification preferences: ${error.message}`);
      }

      return data as NotificationPreferences;
    } else {
      // Create new preferences
      const { data, error } = await supabase
        .from('notification_preferences')
        .insert({
          user_id: userId,
          email_notifications: preferences.email_notifications ?? true,
          push_notifications: preferences.push_notifications ?? true,
          listing_view: preferences.listing_view ?? true,
          listing_save: preferences.listing_save ?? true,
          connection_request: preferences.connection_request ?? true,
          document_access_request: preferences.document_access_request ?? true,
          document_access_response: preferences.document_access_response ?? true,
          message_received: preferences.message_received ?? true,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Error creating notification preferences: ${error.message}`);
      }

      return data as NotificationPreferences;
    }
  }

  /**
   * Subscribe to real-time notifications
   * @param userId The user ID
   * @param callback Function to call when a new notification is received
   * @returns A function to unsubscribe
   */
  static subscribeToNotifications(
    userId: string,
    callback: (notification: Notification) => void
  ): () => void {
    const subscription = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }
}
