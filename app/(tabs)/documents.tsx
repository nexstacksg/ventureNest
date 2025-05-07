import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { BusinessService } from '@/services/business';
import { DocumentService } from '@/services/document';
import { Document, DocumentType } from '@/types/document';

export default function DocumentsScreen() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
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
          // Load documents
          const userDocuments = await DocumentService.getDocumentsByBusinessProfileId(profile.id);
          setDocuments(userDocuments);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load documents');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleUploadDocument = () => {
    router.push('/upload-document');
  };

  const handleViewAccessRequests = () => {
    router.push('/access-requests');
  };

  const getDocumentTypeLabel = (type: DocumentType): string => {
    switch (type) {
      case 'pitch_deck':
        return 'Pitch Deck';
      case 'financial_statement':
        return 'Financial Statement';
      case 'business_plan':
        return 'Business Plan';
      case 'market_analysis':
        return 'Market Analysis';
      case 'other':
      default:
        return 'Other Document';
    }
  };

  const getDocumentIcon = (fileType: string) => {
    const type = fileType.toLowerCase();
    if (type === 'pdf' || type === 'doc' || type === 'docx') {
      return 'document-text' as const;
    } else if (type === 'xls' || type === 'xlsx') {
      return 'grid' as const;
    } else if (type === 'ppt' || type === 'pptx') {
      return 'easel' as const;
    } else if (type === 'jpg' || type === 'jpeg' || type === 'png') {
      return 'image' as const;
    } else {
      return 'document' as const;
    }
  };

  const renderDocumentItem = ({ item }: { item: Document }) => {
    const iconName = getDocumentIcon(item.file_type);
    
    return (
      <TouchableOpacity style={styles.documentItem}>
        <View style={styles.documentIconContainer}>
          <Ionicons name={iconName} size={24} color="#2563EB" />
        </View>
        
        <View style={styles.documentContent}>
          <Text style={styles.documentName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.documentType}>{getDocumentTypeLabel(item.document_type)}</Text>
          <Text style={styles.documentDate}>
            Uploaded: {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        
        {item.is_confidential && (
          <View style={styles.confidentialBadge}>
            <Text style={styles.confidentialText}>Confidential</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading documents...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Documents</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.requestsButton}
            onPress={handleViewAccessRequests}
          >
            <Text style={styles.requestsButtonText}>Access Requests</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={handleUploadDocument}
          >
            <Text style={styles.uploadButtonText}>Upload</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {documents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.emptyImage}
            resizeMode="contain"
          />
          <Text style={styles.emptyTitle}>No Documents Yet</Text>
          <Text style={styles.emptyText}>
            Upload business documents to share with potential investors. 
            You can mark documents as confidential to control access.
          </Text>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={handleUploadDocument}
          >
            <Text style={styles.emptyButtonText}>Upload Your First Document</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={documents}
          renderItem={renderDocumentItem}
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
  headerButtons: {
    flexDirection: 'row',
  },
  requestsButton: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  requestsButtonText: {
    color: '#2563EB',
    fontWeight: '500',
    fontSize: 14,
  },
  uploadButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  uploadButtonText: {
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
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  documentContent: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  documentType: {
    fontSize: 14,
    color: '#64748B',
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
});
