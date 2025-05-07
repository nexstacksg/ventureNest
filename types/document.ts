/**
 * Document-related type definitions
 */

export type DocumentType = 'pitch_deck' | 'financial_statement' | 'business_plan' | 'market_analysis' | 'other';

export interface Document {
  id: string;
  business_profile_id: string;
  name: string;
  file_url: string;
  file_type: string;
  document_type: DocumentType;
  description?: string;
  is_confidential: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentUploadFormData {
  name: string;
  file: File;
  document_type: DocumentType;
  description?: string;
  is_confidential: boolean;
}

export interface DocumentAccessRequest {
  id: string;
  document_id: string;
  investor_id: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  responded_at?: string;
  document?: Document;
}
