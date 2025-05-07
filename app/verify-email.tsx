import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';

export default function VerifyEmailScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Using a placeholder image until we have the proper assets */}
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.image}
          contentFit="contain"
        />
        
        <Text style={styles.title}>Check Your Email</Text>
        
        <Text style={styles.description}>
          We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
        </Text>
        
        <Text style={styles.note}>
          If you don't see the email, check your spam folder or try the button below to resend the verification email.
        </Text>
        
        <TouchableOpacity style={styles.resendButton}>
          <Text style={styles.resendButtonText}>Resend Verification Email</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.replace('/login')}
        >
          <Text style={styles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    justifyContent: 'center',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1E293B',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  note: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  resendButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  resendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    padding: 12,
  },
  backButtonText: {
    color: '#64748B',
    fontSize: 16,
  },
});
