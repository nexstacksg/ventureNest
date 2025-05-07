/**
 * Business profile-related type definitions
 */

export interface BusinessProfile {
  id: string;
  user_id: string;
  company_name: string;
  description: string;
  logo_url?: string;
  industry_tags: string[];
  website_url?: string;
  social_media: SocialMediaLinks;
  created_at: string;
  updated_at: string;
}

export interface SocialMediaLinks {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
}

export interface BusinessProfileFormData {
  company_name: string;
  description: string;
  logo_url?: string;
  industry_tags: string[];
  website_url?: string;
  social_media: SocialMediaLinks;
}

export interface CompanyListing {
  id: string;
  business_profile_id: string;
  title: string;
  description: string;
  asking_price?: number;
  equity_percentage?: number;
  is_full_company: boolean;
  status: 'draft' | 'published' | 'under_review' | 'sold';
  created_at: string;
  updated_at: string;
}

export interface ListingFormData {
  title: string;
  description: string;
  asking_price?: number;
  equity_percentage?: number;
  is_full_company: boolean;
}
