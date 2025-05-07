import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { router } from 'expo-router';

export default function NotificationsScreen() {
  const { user } = useAuth();
  const { notifications, markAsRead, markAllAsRead, isLoading } = useNotifications();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const handleNotificationPress = (notificationId: string) => {
    // Mark the notification as read
    markAsRead(notificationId);
    
    // Navigate based on notification type if needed
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      if (notification.type.includes('document_request')) {
        router.push('/access-requests');
      } else if (notification.related_id) {
        // Navigate to the related item if there is one
        if (notification.type.includes('listing')) {
          router.push(`/listing/${notification.related_id}`);
        } else if (notification.type.includes('document')) {
          router.push(`/document/${notification.related_id}`);
        }
      }
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const filteredNotifications = showUnreadOnly 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const renderNotificationItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={[styles.notificationItem, !item.is_read && styles.unreadNotification]}
        onPress={() => handleNotificationPress(item.id)}
      >
        <View style={styles.notificationIconContainer}>
          <Ionicons 
            name={item.type.includes('document') ? 'document' : 
                  item.type.includes('message') ? 'mail' : 'notifications'} 
            size={24} 
            color="#2563EB" 
          />
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationDate}>
            {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString()}
          </Text>
        </View>
        {!item.is_read && (
          <View style={styles.unreadDot} />
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {notifications.some(n => !n.is_read) && (
          <TouchableOpacity 
            style={styles.markAllReadButton}
            onPress={handleMarkAllAsRead}
          >
            <Text style={styles.markAllReadText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.filterContainer}>
        <Text style={styles.filterText}>Show unread only</Text>
        <Switch
          value={showUnreadOnly}
          onValueChange={setShowUnreadOnly}
          trackColor={{ false: '#E2E8F0', true: '#BFDBFE' }}
          thumbColor={showUnreadOnly ? '#2563EB' : '#F9FAFB'}
        />
      </View>
      
      {filteredNotifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={64} color="#94A3B8" />
          <Text style={styles.emptyTitle}>
            {showUnreadOnly ? 'No unread notifications' : 'No notifications yet'}
          </Text>
          <Text style={styles.emptyText}>
            {showUnreadOnly 
              ? 'You have read all your notifications. Toggle the switch to see all notifications.'
              : 'When you receive notifications, they will appear here.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  markAllReadButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  markAllReadText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  filterText: {
    fontSize: 16,
    color: '#1E293B',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  listContainer: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
    marginLeft: 8,
    alignSelf: 'center',
  },
});
