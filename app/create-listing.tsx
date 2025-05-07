import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { BusinessService } from '@/services/business';
import { ListingFormData } from '@/types/business';
import ListingForm from '@/components/ListingForm';

export default function CreateListingScreen() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [businessProfileId, setBusinessProfileId] = useState<string | null>(null);
  
  // Check if the user has a business profile
  useEffect(() => {
    const checkBusinessProfile = async () => {
      if (!user) {
        router.replace('/login');
        return;
      }

      try {
        setIsLoading(true);
        const profile = await BusinessService.getBusinessProfileByUserId(user.id);
        
        if (!profile) {
          // User doesn't have a business profile yet
          Alert.alert(
            'Business Profile Required',
            'You need to create a business profile before listing your company or equity shares.',
            [
              {
                text: 'Create Profile',
                onPress: () => router.replace('/create-business-profile'),
              },
            ],
            { cancelable: false }
          );
          return;
        }
        
        setBusinessProfileId(profile.id);
      } catch (err: any) {
        setError(err.message || 'Failed to check business profile');
      } finally {
        setIsLoading(false);
      }
    };

    checkBusinessProfile();
  }, [user]);

  const handleSubmit = async (formData: ListingFormData) => {
    if (!businessProfileId) {
      return;
    }

    try {
      setIsLoading(true);
      await BusinessService.createListing(businessProfileId, formData);
      
      // Navigate back instead of to a specific route to avoid TypeScript errors
      router.back();
    } catch (err: any) {
      setError(err.message || 'Failed to create listing');
    } finally {
      setIsLoading(false);
    }
  };

  if (!businessProfileId && !isLoading) {
    return null; // Will redirect in useEffect
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Create New Listing</Text>
          <Text style={styles.subtitle}>
            List your company for sale or offer equity shares to potential investors
          </Text>
        </View>
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {businessProfileId && (
          <ListingForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 22,
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
});
