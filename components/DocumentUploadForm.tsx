import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Switch, ActivityIndicator, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { DocumentType, DocumentUploadFormData } from '@/types/document';

interface DocumentUploadFormProps {
  onSubmit: (data: DocumentUploadFormData) => Promise<void>;
  isLoading: boolean;
}

export default function DocumentUploadForm({ onSubmit, isLoading }: DocumentUploadFormProps) {
  const [formData, setFormData] = useState<DocumentUploadFormData>({
    name: '',
    file: null as any, // Will be set when a file is picked
    document_type: 'other',
    description: '',
    is_confidential: false,
  });
  
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof DocumentUploadFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedFile = result.assets[0];
        setFileName(selectedFile.name);
        
        // Create a File object from the asset
        const fileResponse = await fetch(selectedFile.uri);
        const blob = await fileResponse.blob();
        const file = new File([blob], selectedFile.name, { type: selectedFile.mimeType });
        
        handleChange('file', file);
      }
    } catch (err) {
      console.error('Error picking document:', err);
      setError('Failed to pick document');
    }
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.name) {
      setError('Document name is required');
      return;
    }

    if (!formData.file) {
      setError('Please select a document to upload');
      return;
    }

    try {
      await onSubmit(formData);
      
      // Reset form after successful submission
      setFormData({
        name: '',
        file: null as any,
        document_type: 'other',
        description: '',
        is_confidential: false,
      });
      setFileName(null);
    } catch (err: any) {
      setError(err.message || 'Failed to upload document');
    }
  };

  const documentTypes: { value: DocumentType; label: string }[] = [
    { value: 'pitch_deck', label: 'Pitch Deck' },
    { value: 'financial_statement', label: 'Financial Statement' },
    { value: 'business_plan', label: 'Business Plan' },
    { value: 'market_analysis', label: 'Market Analysis' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        {error && <Text style={styles.errorText}>{error}</Text>}
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Document Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter document name"
            value={formData.name}
            onChangeText={(text) => handleChange('name', text)}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Document Type *</Text>
          <View style={styles.pickerContainer}>
            {documentTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeOption,
                  formData.document_type === type.value && styles.selectedTypeOption,
                ]}
                onPress={() => handleChange('document_type', type.value)}
              >
                <Text
                  style={[
                    styles.typeOptionText,
                    formData.document_type === type.value && styles.selectedTypeOptionText,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter document description"
            value={formData.description}
            onChangeText={(text) => handleChange('description', text)}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
        
        <TouchableOpacity
          style={styles.filePickerButton}
          onPress={pickDocument}
          disabled={isLoading}
        >
          <Text style={styles.filePickerButtonText}>
            {fileName ? 'Change Document' : 'Select Document'}
          </Text>
        </TouchableOpacity>
        
        {fileName && (
          <View style={styles.fileInfoContainer}>
            <Text style={styles.fileNameText} numberOfLines={1} ellipsizeMode="middle">
              {fileName}
            </Text>
          </View>
        )}
        
        <View style={styles.switchContainer}>
          <View>
            <Text style={styles.switchLabel}>Confidential Document</Text>
            <Text style={styles.switchDescription}>
              Investors will need to request access to view this document
            </Text>
          </View>
          <Switch
            value={formData.is_confidential}
            onValueChange={(value) => handleChange('is_confidential', value)}
            trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
            thumbColor={formData.is_confidential ? '#2563EB' : '#94A3B8'}
          />
        </View>
        
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isLoading || !formData.file}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Upload Document</Text>
          )}
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
  formContainer: {
    padding: 20,
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 16,
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#64748B',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  typeOption: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTypeOption: {
    backgroundColor: '#DBEAFE',
  },
  typeOptionText: {
    color: '#64748B',
    fontSize: 14,
  },
  selectedTypeOptionText: {
    color: '#2563EB',
    fontWeight: '500',
  },
  filePickerButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  filePickerButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '500',
  },
  fileInfoContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  fileNameText: {
    color: '#1E293B',
    fontSize: 14,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  switchLabel: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 12,
    color: '#64748B',
    maxWidth: '80%',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
