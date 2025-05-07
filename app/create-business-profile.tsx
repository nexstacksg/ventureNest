import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { BusinessService } from '@/services/business';
import { BusinessProfileFormData } from '@/types/business';
import BusinessProfileForm from '@/components/BusinessProfileForm';

export default function CreateBusinessProfileScreen() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: BusinessProfileFormData) => {
    if (!user) {
      router.replace('/login');
      return;
    }

    try {
      setIsLoading(true);
      
      // If there's a logo_url that's a local URI, we would upload it here
      // For now, we'll just use it as is for demonstration purposes
      
      await BusinessService.createBusinessProfile(user.id, formData);
      
      // Navigate to the business profile page or dashboard
      // Using router.back() instead of a direct path to avoid TypeScript errors
      router.back();
    } catch (err: any) {
      setError(err.message || 'Failed to create business profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Business Profile</Text>
          <Text style={styles.subtitle}>
            Complete your business profile to showcase your venture to potential investors
          </Text>
        </View>
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        <BusinessProfileForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
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
