import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Switch, ActivityIndicator, ScrollView } from 'react-native';
import { ListingFormData } from '@/types/business';

interface ListingFormProps {
  initialData?: Partial<ListingFormData>;
  onSubmit: (data: ListingFormData) => Promise<void>;
  isLoading: boolean;
}

export default function ListingForm({ initialData, onSubmit, isLoading }: ListingFormProps) {
  const [formData, setFormData] = useState<ListingFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    asking_price: initialData?.asking_price,
    equity_percentage: initialData?.equity_percentage,
    is_full_company: initialData?.is_full_company || false,
  });
  
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof ListingFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleNumberChange = (field: 'asking_price' | 'equity_percentage', value: string) => {
    if (value === '') {
      // Use null instead of undefined to avoid type issues
      setFormData(prev => ({ ...prev, [field]: null }));
      return;
    }
    
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      handleChange(field, numValue);
    }
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.title) {
      setError('Title is required');
      return;
    }

    if (!formData.description) {
      setError('Description is required');
      return;
    }

    if (formData.is_full_company && !formData.asking_price) {
      setError('Asking price is required for full company listings');
      return;
    }

    if (!formData.is_full_company && !formData.equity_percentage) {
      setError('Equity percentage is required for equity share listings');
      return;
    }

    if (formData.equity_percentage && (formData.equity_percentage <= 0 || formData.equity_percentage > 100)) {
      setError('Equity percentage must be between 0 and 100');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'Failed to save listing');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        {error && <Text style={styles.errorText}>{error}</Text>}
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Listing Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter a title for your listing"
            value={formData.title}
            onChangeText={(text) => handleChange('title', text)}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your business opportunity"
            value={formData.description}
            onChangeText={(text) => handleChange('description', text)}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>
        
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>
            {formData.is_full_company ? 'Selling entire company' : 'Offering equity shares'}
          </Text>
          <Switch
            value={formData.is_full_company}
            onValueChange={(value) => handleChange('is_full_company', value)}
            trackColor={{ false: '#CBD5E1', true: '#BFDBFE' }}
            thumbColor={formData.is_full_company ? '#2563EB' : '#94A3B8'}
          />
        </View>
        
        {formData.is_full_company ? (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Asking Price ($) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter asking price"
              value={formData.asking_price?.toString() || ''}
              onChangeText={(text) => handleNumberChange('asking_price', text)}
              keyboardType="numeric"
            />
          </View>
        ) : (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Equity Percentage (%) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter equity percentage"
              value={formData.equity_percentage?.toString() || ''}
              onChangeText={(text) => handleNumberChange('equity_percentage', text)}
              keyboardType="numeric"
            />
          </View>
        )}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Save Listing</Text>
            )}
          </TouchableOpacity>
        </View>
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
    minHeight: 120,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  switchLabel: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 12,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#2563EB',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
