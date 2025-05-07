/**
 * Notification-related type definitions
 */

export type NotificationType = 
  | 'listing_view'
  | 'listing_save'
  | 'connection_request'
  | 'document_access_request'
  | 'document_access_approved'
  | 'document_access_rejected'
  | 'message_received';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  related_id?: string;
  created_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  listing_view: boolean;
  listing_save: boolean;
  connection_request: boolean;
  document_access_request: boolean;
  document_access_response: boolean;
  message_received: boolean;
}
