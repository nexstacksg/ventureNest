import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { BusinessService } from '@/services/business';
import { CompanyListing } from '@/types/business';

export default function ListingsScreen() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [listings, setListings] = useState<CompanyListing[]>([]);
  const [error, setError] = useState<string | null>(null);

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
        
        if (profile) {
          // Load listings
          const userListings = await BusinessService.getListingsByBusinessProfileId(profile.id);
          setListings(userListings);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load listings');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleCreateListing = () => {
    router.push('/create-listing');
  };

  const renderListingItem = ({ item }: { item: CompanyListing }) => {
    return (
      <TouchableOpacity style={styles.listingItem}>
        <View style={styles.listingHeader}>
          <Text style={styles.listingTitle}>{item.title}</Text>
          <View style={[
            styles.statusBadge,
            item.status === 'published' ? styles.publishedBadge : 
            item.status === 'draft' ? styles.draftBadge : 
            item.status === 'under_review' ? styles.reviewBadge : 
            styles.soldBadge
          ]}>
            <Text style={styles.statusText}>
              {item.status === 'published' ? 'Published' : 
               item.status === 'draft' ? 'Draft' : 
               item.status === 'under_review' ? 'Under Review' : 
               'Sold'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.listingDescription} numberOfLines={3}>
          {item.description}
        </Text>
        
        <View style={styles.listingDetails}>
          {item.is_full_company ? (
            <Text style={styles.listingPrice}>
              Asking Price: ${item.asking_price?.toLocaleString() || 'Not specified'}
            </Text>
          ) : (
            <Text style={styles.listingEquity}>
              Equity: {item.equity_percentage}%
            </Text>
          )}
          
          <Text style={styles.listingDate}>
            Created: {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading listings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Listings</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreateListing}
        >
          <Text style={styles.createButtonText}>Create Listing</Text>
        </TouchableOpacity>
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {listings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.emptyImage}
            resizeMode="contain"
          />
          <Text style={styles.emptyTitle}>No Listings Yet</Text>
          <Text style={styles.emptyText}>
            Create your first listing to showcase your business or equity offering to potential investors.
          </Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={handleCreateListing}
          >
            <Text style={styles.emptyButtonText}>Create Your First Listing</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={listings}
          renderItem={renderListingItem}
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
  createButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  emptyButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  listingItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    fontSize: 18,
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
  soldBadge: {
    backgroundColor: '#DBEAFE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1E293B',
  },
  listingDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 20,
  },
  listingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listingPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563EB',
  },
  listingEquity: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563EB',
  },
  listingDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
});
