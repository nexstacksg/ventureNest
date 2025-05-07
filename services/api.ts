import { HelloResponse } from '@/types/api';

/**
 * API service for handling Hello World requests
 */
export class HelloApiService {
  /**
   * Simulates fetching a hello world message from an API
   * @returns Promise with HelloResponse
   */
  static async getHelloWorld(): Promise<HelloResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      message: 'Hello World from API Service',
      timestamp: new Date().toISOString()
    };
  }
}
