import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { BusinessProfileFormData, SocialMediaLinks } from '@/types/business';

interface BusinessProfileFormProps {
  initialData?: Partial<BusinessProfileFormData>;
  onSubmit: (data: BusinessProfileFormData) => Promise<void>;
  isLoading: boolean;
}

export default function BusinessProfileForm({ initialData, onSubmit, isLoading }: BusinessProfileFormProps) {
  const [formData, setFormData] = useState<BusinessProfileFormData>({
    company_name: initialData?.company_name || '',
    description: initialData?.description || '',
    logo_url: initialData?.logo_url,
    industry_tags: initialData?.industry_tags || [],
    website_url: initialData?.website_url || '',
    social_media: initialData?.social_media || {
      linkedin: '',
      twitter: '',
      facebook: '',
      instagram: '',
    },
  });
  
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof BusinessProfileFormData, value: string | string[] | SocialMediaLinks) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSocialMediaChange = (platform: keyof SocialMediaLinks, value: string) => {
    setFormData(prev => ({
      ...prev,
      social_media: {
        ...prev.social_media,
        [platform]: value,
      },
    }));
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    
    const newTag = tagInput.trim();
    if (!formData.industry_tags.includes(newTag)) {
      handleChange('industry_tags', [...formData.industry_tags, newTag]);
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    handleChange(
      'industry_tags',
      formData.industry_tags.filter(tag => tag !== tagToRemove)
    );
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      // In a real app, you would upload this to storage and get a URL
      // For now, we'll just use the local URI as a placeholder
      handleChange('logo_url', result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.company_name) {
      setError('Company name is required');
      return;
    }

    if (!formData.description) {
      setError('Company description is required');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'Failed to save business profile');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        {error && <Text style={styles.errorText}>{error}</Text>}
        
        <View style={styles.logoContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.logoPickerButton}>
            {formData.logo_url ? (
              <Image
                source={{ uri: formData.logo_url }}
                style={styles.logoImage}
                contentFit="cover"
              />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoPlaceholderText}>Add Logo</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.logoHint}>Tap to upload company logo</Text>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Company Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter company name"
            value={formData.company_name}
            onChangeText={(text) => handleChange('company_name', text)}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your business"
            value={formData.description}
            onChangeText={(text) => handleChange('description', text)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Website</Text>
          <TextInput
            style={styles.input}
            placeholder="https://yourcompany.com"
            value={formData.website_url}
            onChangeText={(text) => handleChange('website_url', text)}
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Industry Tags</Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              placeholder="Add industry tags"
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={addTag}
            />
            <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
              <Text style={styles.addTagButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.tagsContainer}>
            {formData.industry_tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
                <TouchableOpacity onPress={() => removeTag(tag)}>
                  <Text style={styles.removeTagText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
        
        <Text style={styles.sectionTitle}>Social Media Links</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>LinkedIn</Text>
          <TextInput
            style={styles.input}
            placeholder="LinkedIn profile URL"
            value={formData.social_media.linkedin}
            onChangeText={(text) => handleSocialMediaChange('linkedin', text)}
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Twitter</Text>
          <TextInput
            style={styles.input}
            placeholder="Twitter profile URL"
            value={formData.social_media.twitter}
            onChangeText={(text) => handleSocialMediaChange('twitter', text)}
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Facebook</Text>
          <TextInput
            style={styles.input}
            placeholder="Facebook page URL"
            value={formData.social_media.facebook}
            onChangeText={(text) => handleSocialMediaChange('facebook', text)}
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Instagram</Text>
          <TextInput
            style={styles.input}
            placeholder="Instagram profile URL"
            value={formData.social_media.instagram}
            onChangeText={(text) => handleSocialMediaChange('instagram', text)}
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>
        
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Save Business Profile</Text>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoPickerButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 8,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  logoPlaceholderText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  logoHint: {
    fontSize: 12,
    color: '#94A3B8',
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
    minHeight: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 16,
    color: '#1E293B',
  },
  tagInputContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tagInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  addTagButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTagButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#2563EB',
    fontSize: 14,
    marginRight: 4,
  },
  removeTagText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
