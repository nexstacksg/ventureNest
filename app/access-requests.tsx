import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { BusinessService } from '@/services/business';
import { DocumentService } from '@/services/document';
import { DocumentAccessRequest } from '@/types/document';
import AccessRequestList from '@/components/AccessRequestList';

export default function AccessRequestsScreen() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [businessProfileId, setBusinessProfileId] = useState<string | null>(null);
  const [accessRequests, setAccessRequests] = useState<DocumentAccessRequest[]>([]);
  
  // Check if the user has a business profile and load access requests
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        router.replace('/login');
        return;
      }

      try {
        setIsLoading(true);
        
        // Get business profile
        const profile = await BusinessService.getBusinessProfileByUserId(user.id);
        
        if (!profile) {
          // User doesn't have a business profile yet
          Alert.alert(
            'Business Profile Required',
            'You need to create a business profile to manage document access requests.',
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
        
        // Load access requests
        const requests = await DocumentService.getAccessRequestsByBusinessProfileId(profile.id);
        setAccessRequests(requests);
      } catch (err: any) {
        setError(err.message || 'Failed to load access requests');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleApprove = async (requestId: string) => {
    try {
      setIsLoading(true);
      await DocumentService.respondToAccessRequest(requestId, true);
      
      // Update the local state
      setAccessRequests(prevRequests => 
        prevRequests.map(request => 
          request.id === requestId 
            ? { 
                ...request, 
                status: 'approved', 
                responded_at: new Date().toISOString() 
              } 
            : request
        )
      );
      
      Alert.alert('Success', 'Access request approved');
    } catch (err: any) {
      setError(err.message || 'Failed to approve request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setIsLoading(true);
      await DocumentService.respondToAccessRequest(requestId, false);
      
      // Update the local state
      setAccessRequests(prevRequests => 
        prevRequests.map(request => 
          request.id === requestId 
            ? { 
                ...request, 
                status: 'rejected', 
                responded_at: new Date().toISOString() 
              } 
            : request
        )
      );
      
      Alert.alert('Success', 'Access request rejected');
    } catch (err: any) {
      setError(err.message || 'Failed to reject request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Document Access Requests</Text>
        <Text style={styles.subtitle}>
          Manage investor requests to access your confidential documents
        </Text>
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      <AccessRequestList
        requests={accessRequests}
        isLoading={isLoading}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
