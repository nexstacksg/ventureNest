import { supabase } from './supabase';
import { Document, DocumentType, DocumentUploadFormData, DocumentAccessRequest } from '@/types/document';

/**
 * Service for handling document operations
 */
export class DocumentService {
  /**
   * Upload a document
   * @param businessProfileId The business profile ID
   * @param documentData The document data
   * @returns The uploaded document
   */
  static async uploadDocument(
    businessProfileId: string,
    documentData: DocumentUploadFormData
  ): Promise<Document> {
    // First upload the file to storage
    const fileExt = documentData.file.name.split('.').pop();
    const fileName = `${businessProfileId}-${Date.now()}.${fileExt}`;
    const filePath = `documents/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('business-assets')
      .upload(filePath, documentData.file);

    if (uploadError) {
      throw new Error(`Error uploading document: ${uploadError.message}`);
    }

    // Get the public URL for the file
    const { data: urlData } = supabase.storage
      .from('business-assets')
      .getPublicUrl(filePath);

    // Now create the document record in the database
    const { data, error } = await supabase
      .from('documents')
      .insert({
        business_profile_id: businessProfileId,
        name: documentData.name,
        file_url: urlData.publicUrl,
        file_type: fileExt,
        document_type: documentData.document_type,
        description: documentData.description,
        is_confidential: documentData.is_confidential,
        version: 1 // Initial version
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating document record: ${error.message}`);
    }

    return data as Document;
  }

  /**
   * Get all documents for a business profile
   * @param businessProfileId The business profile ID
   * @returns Array of documents
   */
  static async getDocumentsByBusinessProfileId(businessProfileId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('business_profile_id', businessProfileId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching documents: ${error.message}`);
    }

    return data as Document[];
  }

  /**
   * Get a document by ID
   * @param documentId The document ID
   * @returns The document or null if not found
   */
  static async getDocumentById(documentId: string): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error fetching document: ${error.message}`);
    }

    return data as Document;
  }

  /**
   * Update a document
   * @param documentId The document ID
   * @param documentData The updated document data
   * @returns The updated document
   */
  static async updateDocument(
    documentId: string,
    documentData: Partial<Omit<DocumentUploadFormData, 'file'>>
  ): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .update(documentData)
      .eq('id', documentId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating document: ${error.message}`);
    }

    return data as Document;
  }

  /**
   * Delete a document
   * @param documentId The document ID
   */
  static async deleteDocument(documentId: string): Promise<void> {
    // First get the document to get the file path
    const document = await this.getDocumentById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Extract the file path from the URL
    const fileUrl = document.file_url;
    const filePath = fileUrl.split('/').pop();

    // Delete the file from storage
    if (filePath) {
      const { error: storageError } = await supabase.storage
        .from('business-assets')
        .remove([`documents/${filePath}`]);

      if (storageError) {
        console.error(`Error deleting file from storage: ${storageError.message}`);
        // Continue with deleting the record even if file deletion fails
      }
    }

    // Delete the document record
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (error) {
      throw new Error(`Error deleting document: ${error.message}`);
    }
  }

  /**
   * Request access to a confidential document
   * @param documentId The document ID
   * @param investorId The investor ID
   * @returns The access request
   */
  static async requestDocumentAccess(
    documentId: string,
    investorId: string
  ): Promise<DocumentAccessRequest> {
    // Check if there's already a pending request
    const { data: existingRequest, error: checkError } = await supabase
      .from('document_access_requests')
      .select('*')
      .eq('document_id', documentId)
      .eq('investor_id', investorId)
      .eq('status', 'pending')
      .single();

    if (existingRequest) {
      return existingRequest as DocumentAccessRequest;
    }

    // Create a new request
    const { data, error } = await supabase
      .from('document_access_requests')
      .insert({
        document_id: documentId,
        investor_id: investorId,
        status: 'pending',
        requested_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating access request: ${error.message}`);
    }

    return data as DocumentAccessRequest;
  }

  /**
   * Respond to a document access request
   * @param requestId The request ID
   * @param approved Whether the request is approved
   * @returns The updated access request
   */
  static async respondToAccessRequest(
    requestId: string,
    approved: boolean
  ): Promise<DocumentAccessRequest> {
    const { data, error } = await supabase
      .from('document_access_requests')
      .update({
        status: approved ? 'approved' : 'rejected',
        responded_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error responding to access request: ${error.message}`);
    }

    return data as DocumentAccessRequest;
  }

  /**
   * Get all access requests for a business profile
   * @param businessProfileId The business profile ID
   * @returns Array of access requests
   */
  static async getAccessRequestsByBusinessProfileId(
    businessProfileId: string
  ): Promise<DocumentAccessRequest[]> {
    const { data, error } = await supabase
      .from('document_access_requests')
      .select(`
        *,
        documents:document_id(*)
      `)
      .eq('documents.business_profile_id', businessProfileId)
      .order('requested_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching access requests: ${error.message}`);
    }

    return data as unknown as DocumentAccessRequest[];
  }
}
