import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { BusinessService } from '@/services/business';
import { DocumentService } from '@/services/document';
import { BusinessProfile } from '@/types/business';
import { Document } from '@/types/document';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const [isLoading, setIsLoading] = useState(true);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) {
        router.replace('/login');
        return;
      }

      try {
        setIsLoading(true);
        
        // Get business profile
        const profile = await BusinessService.getBusinessProfileByUserId(user.id);
        setBusinessProfile(profile);
        
        if (profile) {
          // Load recent documents
          const documents = await DocumentService.getDocumentsByBusinessProfileId(profile.id);
          setRecentDocuments(documents.slice(0, 3)); // Get only the 3 most recent
          
          // Load recent listings
          const listings = await BusinessService.getListingsByBusinessProfileId(profile.id);
          setRecentListings(listings.slice(0, 3)); // Get only the 3 most recent
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>{user?.email?.split('@')[0] || 'User'}</Text>
        </View>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => router.push('/notifications')}
        >
          <Ionicons name="notifications" size={24} color="#2563EB" />
          {notifications.filter(n => !n.is_read).length > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {notifications.filter(n => !n.is_read).length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!businessProfile ? (
        <View style={styles.createProfileCard}>
          <Text style={styles.createProfileTitle}>Complete Your Profile</Text>
          <Text style={styles.createProfileText}>
            Create a business profile to showcase your company to potential investors.
          </Text>
          <TouchableOpacity 
            style={styles.createProfileButton}
            onPress={() => router.push('/create-business-profile')}
          >
            <Text style={styles.createProfileButtonText}>Create Business Profile</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.profileSummaryCard}>
          <View style={styles.profileHeader}>
            {businessProfile.logo_url ? (
              <Image
                source={{ uri: businessProfile.logo_url }}
                style={styles.profileLogo}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.profileLogoPlaceholder}>
                <Text style={styles.profileLogoText}>
                  {businessProfile.company_name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{businessProfile.company_name}</Text>
              {businessProfile.industry_tags && businessProfile.industry_tags.length > 0 && (
                <Text style={styles.profileIndustry}>{businessProfile.industry_tags[0]}</Text>
              )}
            </View>
          </View>
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => router.push({ pathname: '/create-business-profile', params: { editing: 'true' } })}
          >
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/create-listing')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="list" size={24} color="#2563EB" />
          </View>
          <Text style={styles.actionText}>Create Listing</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/upload-document')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#F0FDF4' }]}>
            <Ionicons name="document-text" size={24} color="#16A34A" />
          </View>
          <Text style={styles.actionText}>Upload Document</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/access-requests')}
        >
          <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="key" size={24} color="#D97706" />
          </View>
          <Text style={styles.actionText}>Access Requests</Text>
        </TouchableOpacity>
      </View>

      {recentListings.length > 0 && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Listings</Text>
            <TouchableOpacity onPress={() => router.push('/listings')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recentListings.map((listing, index) => (
            <View key={index} style={styles.listingItem}>
              <View style={styles.listingHeader}>
                <Text style={styles.listingTitle} numberOfLines={1}>{listing.title}</Text>
                <View style={[styles.statusBadge, 
                  listing.status === 'published' ? styles.publishedBadge : 
                  listing.status === 'draft' ? styles.draftBadge : styles.reviewBadge]}>
                  <Text style={styles.statusText}>
                    {listing.status === 'published' ? 'Published' : 
                     listing.status === 'draft' ? 'Draft' : 'Under Review'}
                  </Text>
                </View>
              </View>
              <Text style={styles.listingDescription} numberOfLines={2}>{listing.description}</Text>
            </View>
          ))}
        </View>
      )}

      {recentDocuments.length > 0 && (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Documents</Text>
            <TouchableOpacity onPress={() => router.push('/documents')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recentDocuments.map((document, index) => (
            <View key={index} style={styles.documentItem}>
              <View style={styles.documentIconContainer}>
                <Ionicons name="document-text" size={24} color="#2563EB" />
              </View>
              <View style={styles.documentContent}>
                <Text style={styles.documentName} numberOfLines={1}>{document.name}</Text>
                <Text style={styles.documentDate}>
                  Uploaded: {new Date(document.created_at).toLocaleDateString()}
                </Text>
              </View>
              {document.is_confidential && (
                <View style={styles.confidentialBadge}>
                  <Text style={styles.confidentialText}>Confidential</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {notifications.length > 0 && (
        <View style={[styles.sectionContainer, { marginBottom: 32 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Notifications</Text>
            <TouchableOpacity onPress={() => router.push('/notifications')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {notifications.slice(0, 3).map((notification, index) => (
            <View key={index} style={[styles.notificationItem, !notification.is_read && styles.unreadNotification]}>
              <View style={styles.notificationIconContainer}>
                <Ionicons 
                  name={notification.type.includes('document') ? 'document' : 
                        notification.type.includes('message') ? 'mail' : 'notifications'} 
                  size={24} 
                  color="#2563EB" 
                />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationMessage} numberOfLines={2}>{notification.message}</Text>
                <Text style={styles.notificationDate}>
                  {new Date(notification.created_at).toLocaleDateString()}
                </Text>
              </View>
              {!notification.is_read && (
                <View style={styles.unreadDot} />
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
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
  greeting: {
    fontSize: 16,
    color: '#64748B',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  errorContainer: {
    margin: 20,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
  },
  createProfileCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  createProfileTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  createProfileText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 20,
  },
  createProfileButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  createProfileButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  profileSummaryCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileLogo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  profileLogoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileLogoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  profileIndustry: {
    fontSize: 14,
    color: '#64748B',
  },
  editProfileButton: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  editProfileButtonText: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 14,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1E293B',
    textAlign: 'center',
  },
  sectionContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  seeAllText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  listingItem: {
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
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  publishedBadge: {
    backgroundColor: '#DCFCE7',
  },
  draftBadge: {
    backgroundColor: '#F1F5F9',
  },
  reviewBadge: {
    backgroundColor: '#FEF9C3',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1E293B',
  },
  listingDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  documentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentContent: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  documentDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  confidentialBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  confidentialText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#DC2626',
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
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
    lineHeight: 18,
  },
  notificationDate: {
    fontSize: 10,
    color: '#94A3B8',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginLeft: 8,
    alignSelf: 'center',
  },
});
