/**
 * User-related type definitions
 */

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  user_metadata?: UserMetadata;
}

export interface UserMetadata {
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  is_entrepreneur?: boolean;
  is_investor?: boolean;
}

export interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  remember?: boolean;
}

export interface ProfileFormData {
  full_name: string;
  avatar_url?: string;
  phone?: string;
  user_type: 'entrepreneur' | 'investor';
}

export interface PasswordResetFormData {
  email: string;
}
