import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Initialize the Supabase client
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration. Please check your app.config.js file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Authentication service for handling user registration and login
 */
export class AuthService {
  /**
   * Register a new user
   * @param email User's email
   * @param password User's password
   * @returns Promise with the registration result
   */
  static async register(email: string, password: string) {
    return supabase.auth.signUp({
      email,
      password,
    });
  }

  /**
   * Login an existing user
   * @param email User's email
   * @param password User's password
   * @returns Promise with the login result
   */
  static async login(email: string, password: string) {
    return supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  /**
   * Logout the current user
   * @returns Promise with the logout result
   */
  static async logout() {
    return supabase.auth.signOut();
  }

  /**
   * Reset password for a user
   * @param email User's email
   * @returns Promise with the password reset result
   */
  static async resetPassword(email: string) {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'ventureNest://reset-password',
    });
  }

  /**
   * Get the current user session
   * @returns Promise with the current session
   */
  static async getSession() {
    return supabase.auth.getSession();
  }

  /**
   * Get the current user
   * @returns The current user or null
   */
  static async getCurrentUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
  }
}
