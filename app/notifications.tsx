import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useNotifications } from '@/contexts/NotificationContext';
import NotificationList from '@/components/NotificationList';
import { Notification } from '@/types/notification';

export default function NotificationsScreen() {
  const { notifications, isLoading, markAsRead, markAllAsRead } = useNotifications();

  const handleNotificationPress = async (notification: Notification) => {
    // Mark the notification as read
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // For now, just stay on the notifications screen since we haven't defined all the routes yet
    // This avoids TypeScript errors with undefined routes
    
    // In a real app, we would navigate to the appropriate screen based on the notification type
    // For example:
    switch (notification.type) {
      case 'document_access_request':
        // This route is defined in our app
        router.push('/access-requests');
        break;
      default:
        // For other notification types, just stay on the current screen for now
        console.log('Notification clicked:', notification.title);
        break;
    }
  };

  return (
    <View style={styles.container}>
      <NotificationList
        notifications={notifications}
        isLoading={isLoading}
        onNotificationPress={handleNotificationPress}
        onMarkAllAsRead={markAllAsRead}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
