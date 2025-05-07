import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { DocumentAccessRequest } from '@/types/document';

interface AccessRequestListProps {
  requests: DocumentAccessRequest[];
  isLoading: boolean;
  onApprove: (requestId: string) => Promise<void>;
  onReject: (requestId: string) => Promise<void>;
}

export default function AccessRequestList({ 
  requests, 
  isLoading, 
  onApprove, 
  onReject 
}: AccessRequestListProps) {
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading requests...</Text>
      </View>
    );
  }

  if (requests.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        {/* Using a placeholder image until we have the proper assets */}
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.emptyImage}
          contentFit="contain"
        />
        <Text style={styles.emptyTitle}>No Access Requests</Text>
        <Text style={styles.emptyText}>
          When investors request access to your confidential documents, they will appear here.
        </Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: DocumentAccessRequest }) => {
    const isPending = item.status === 'pending';
    const isApproved = item.status === 'approved';
    const isRejected = item.status === 'rejected';

    return (
      <View style={styles.requestItem}>
        <View style={styles.requestHeader}>
          <View>
            <Text style={styles.investorName}>Investor Name</Text>
            <Text style={styles.documentName}>
              Document: {item.document?.name || 'Confidential Document'}
            </Text>
            <Text style={styles.requestDate}>
              Requested: {new Date(item.requested_at).toLocaleDateString()}
            </Text>
          </View>
          <View style={[
            styles.statusBadge,
            isPending ? styles.pendingBadge : isApproved ? styles.approvedBadge : styles.rejectedBadge
          ]}>
            <Text style={[
              styles.statusText,
              isPending ? styles.pendingText : isApproved ? styles.approvedText : styles.rejectedText
            ]}>
              {isPending ? 'Pending' : isApproved ? 'Approved' : 'Rejected'}
            </Text>
          </View>
        </View>
        
        {isPending && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => onApprove(item.id)}
            >
              <Text style={styles.approveButtonText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => onReject(item.id)}
            >
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {!isPending && (
          <Text style={styles.responseDate}>
            Responded: {item.responded_at ? new Date(item.responded_at).toLocaleDateString() : 'N/A'}
          </Text>
        )}
      </View>
    );
  };

  return (
    <FlatList
      data={requests}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
    />
  );
}

const styles = StyleSheet.create({
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: '80%',
  },
  listContainer: {
    padding: 16,
  },
  requestItem: {
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
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  investorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  documentName: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadge: {
    backgroundColor: '#FEF9C3',
  },
  approvedBadge: {
    backgroundColor: '#DCFCE7',
  },
  rejectedBadge: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  pendingText: {
    color: '#CA8A04',
  },
  approvedText: {
    color: '#16A34A',
  },
  rejectedText: {
    color: '#DC2626',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#EFF6FF',
    marginRight: 8,
  },
  rejectButton: {
    backgroundColor: '#FEF2F2',
  },
  approveButtonText: {
    color: '#2563EB',
    fontWeight: '500',
  },
  rejectButtonText: {
    color: '#DC2626',
    fontWeight: '500',
  },
  responseDate: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 8,
  },
});
