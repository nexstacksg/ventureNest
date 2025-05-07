import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { BusinessService } from '@/services/business';
import { BusinessProfile } from '@/types/business';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        router.replace('/login');
        return;
      }

      try {
        setIsLoading(true);
        const businessProfile = await BusinessService.getBusinessProfileByUserId(user.id);
        setProfile(businessProfile);
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleEditProfile = () => {
    if (profile) {
      router.push({
        pathname: '/create-business-profile',
        params: { editing: 'true' }
      });
    } else {
      router.push('/create-business-profile');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => signOut()
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.userInfoSection}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <Text style={styles.userId}>User ID: {user?.id.substring(0, 8)}...</Text>
          </View>
        </View>
      </View>

      {profile ? (
        <View style={styles.profileSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Business Profile</Text>
            <TouchableOpacity onPress={handleEditProfile}>
              <Text style={styles.editButton}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.companyHeader}>
              {profile.logo_url ? (
                <Image
                  source={{ uri: profile.logo_url }}
                  style={styles.companyLogo}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.placeholderLogo}>
                  <Text style={styles.placeholderText}>
                    {profile.company_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.companyInfo}>
                <Text style={styles.companyName}>{profile.company_name}</Text>
                {profile.website_url && (
                  <Text style={styles.companyWebsite}>{profile.website_url}</Text>
                )}
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionSubtitle}>About</Text>
            <Text style={styles.descriptionText}>{profile.description}</Text>

            {profile.industry_tags && profile.industry_tags.length > 0 && (
              <>
                <Text style={styles.sectionSubtitle}>Industry</Text>
                <View style={styles.tagsContainer}>
                  {profile.industry_tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {profile.social_media && Object.keys(profile.social_media).length > 0 && (
              <>
                <Text style={styles.sectionSubtitle}>Social Media</Text>
                <View style={styles.socialLinksContainer}>
                  {Object.entries(profile.social_media).map(([platform, url], index) => {
                    if (!url) return null;
                    
                    let iconName: any;
                    switch (platform) {
                      case 'linkedin':
                        iconName = 'logo-linkedin';
                        break;
                      case 'twitter':
                        iconName = 'logo-twitter';
                        break;
                      case 'facebook':
                        iconName = 'logo-facebook';
                        break;
                      case 'instagram':
                        iconName = 'logo-instagram';
                        break;
                      default:
                        iconName = 'globe-outline';
                    }
                    
                    return (
                      <View key={index} style={styles.socialLink}>
                        <Ionicons name={iconName} size={20} color="#2563EB" />
                        <Text style={styles.socialLinkText}>
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.noProfileContainer}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.noProfileImage}
            resizeMode="contain"
          />
          <Text style={styles.noProfileTitle}>No Business Profile</Text>
          <Text style={styles.noProfileText}>
            Create a business profile to showcase your company to potential investors.
          </Text>
          <TouchableOpacity 
            style={styles.createProfileButton}
            onPress={handleEditProfile}
          >
            <Text style={styles.createProfileButtonText}>Create Business Profile</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="notifications-outline" size={24} color="#64748B" />
          <Text style={styles.settingsText}>Notification Preferences</Text>
          <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="shield-outline" size={24} color="#64748B" />
          <Text style={styles.settingsText}>Privacy & Security</Text>
          <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="help-circle-outline" size={24} color="#64748B" />
          <Text style={styles.settingsText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingsItem}>
          <Ionicons name="information-circle-outline" size={24} color="#64748B" />
          <Text style={styles.settingsText}>About VentureNest</Text>
          <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  logoutButton: {
    padding: 8,
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
  userInfoSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  userDetails: {
    flex: 1,
  },
  userEmail: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  userId: {
    fontSize: 14,
    color: '#64748B',
  },
  profileSection: {
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  editButton: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  companyLogo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: '#EFF6FF',
  },
  placeholderLogo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  companyWebsite: {
    fontSize: 14,
    color: '#2563EB',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '500',
  },
  socialLinksContainer: {
    marginBottom: 8,
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  socialLinkText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8,
  },
  noProfileContainer: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  noProfileImage: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  noProfileTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  noProfileText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  createProfileButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  createProfileButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  settingsSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 32,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  settingsText: {
    fontSize: 16,
    color: '#1E293B',
    flex: 1,
    marginLeft: 16,
  },
});
