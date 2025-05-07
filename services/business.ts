import { supabase } from './supabase';
import { BusinessProfile, BusinessProfileFormData, CompanyListing, ListingFormData } from '@/types/business';

/**
 * Service for handling business profile operations
 */
export class BusinessService {
  /**
   * Create a new business profile
   * @param userId The user ID
   * @param profileData The business profile data
   * @returns The created business profile
   */
  static async createBusinessProfile(userId: string, formData: BusinessProfileFormData): Promise<BusinessProfile> {
    console.log('Creating business profile for user:', userId);
    console.log('Profile data:', JSON.stringify(formData, null, 2));
    
    try {
      // First check if the profiles table exists and the user has a profile
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.error('Error checking user profile:', profileError);
        // If the user doesn't have a profile, create one
        if (profileError.code === 'PGRST116') { // Not found error
          const { error: insertProfileError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: 'user@example.com', // This should ideally come from auth.user
              full_name: '',
            });
          
          if (insertProfileError) {
            console.error('Error creating user profile:', insertProfileError);
            throw new Error(`Failed to create user profile: ${insertProfileError.message}`);
          }
        } else {
          throw new Error(`Error checking user profile: ${profileError.message}`);
        }
      }
      
      // Now create the business profile
      const { data, error } = await supabase
        .from('business_profiles')
        .insert({
          user_id: userId,
          company_name: formData.company_name,
          description: formData.description,
          logo_url: formData.logo_url,
          industry_tags: formData.industry_tags,
          website_url: formData.website_url,
          social_media: formData.social_media
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating business profile:', error);
        throw new Error(`Error creating business profile: ${error.message} (Code: ${error.code})`);
      }

      console.log('Business profile created successfully:', data);
      return data as BusinessProfile;
    } catch (err) {
      console.error('Unexpected error in createBusinessProfile:', err);
      throw err;
    }
  }

  /**
   * Get a business profile by user ID
   * @param userId The user ID
   * @returns The business profile or null if not found
   */
  static async getBusinessProfileByUserId(userId: string): Promise<BusinessProfile | null> {
    const { data, error } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error fetching business profile: ${error.message}`);
    }

    return data as BusinessProfile;
  }

  /**
   * Update a business profile
   * @param profileId The profile ID
   * @param profileData The updated profile data
   * @returns The updated business profile
   */
  static async updateBusinessProfile(profileId: string, profileData: Partial<BusinessProfileFormData>): Promise<BusinessProfile> {
    const { data, error } = await supabase
      .from('business_profiles')
      .update(profileData)
      .eq('id', profileId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating business profile: ${error.message}`);
    }

    return data as BusinessProfile;
  }

  /**
   * Upload a business logo
   * @param userId The user ID
   * @param file The logo file
   * @returns The URL of the uploaded logo
   */
  static async uploadLogo(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `business-logos/${fileName}`;

    const { error } = await supabase.storage
      .from('business-assets')
      .upload(filePath, file);

    if (error) {
      throw new Error(`Error uploading logo: ${error.message}`);
    }

    const { data } = supabase.storage
      .from('business-assets')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * Create a new company listing
   * @param businessProfileId The business profile ID
   * @param listingData The listing data
   * @returns The created company listing
   */
  static async createListing(businessProfileId: string, listingData: ListingFormData): Promise<CompanyListing> {
    const { data, error } = await supabase
      .from('company_listings')
      .insert({
        business_profile_id: businessProfileId,
        title: listingData.title,
        description: listingData.description,
        asking_price: listingData.asking_price,
        equity_percentage: listingData.equity_percentage,
        is_full_company: listingData.is_full_company,
        status: 'draft'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating listing: ${error.message}`);
    }

    return data as CompanyListing;
  }

  /**
   * Get all listings for a business profile
   * @param businessProfileId The business profile ID
   * @returns Array of company listings
   */
  static async getListingsByBusinessProfileId(businessProfileId: string): Promise<CompanyListing[]> {
    const { data, error } = await supabase
      .from('company_listings')
      .select('*')
      .eq('business_profile_id', businessProfileId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching listings: ${error.message}`);
    }

    return data as CompanyListing[];
  }

  /**
   * Update a company listing
   * @param listingId The listing ID
   * @param listingData The updated listing data
   * @returns The updated company listing
   */
  static async updateListing(listingId: string, listingData: Partial<ListingFormData>): Promise<CompanyListing> {
    const { data, error } = await supabase
      .from('company_listings')
      .update(listingData)
      .eq('id', listingId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating listing: ${error.message}`);
    }

    return data as CompanyListing;
  }

  /**
   * Publish a company listing
   * @param listingId The listing ID
   * @returns The updated company listing
   */
  static async publishListing(listingId: string): Promise<CompanyListing> {
    const { data, error } = await supabase
      .from('company_listings')
      .update({ status: 'published' })
      .eq('id', listingId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error publishing listing: ${error.message}`);
    }

    return data as CompanyListing;
  }
}
