-- Create company_listings table
CREATE TABLE IF NOT EXISTS public.company_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_profile_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  industry_tags TEXT[] DEFAULT '{}',
  location TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.company_listings ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to view all active listings
CREATE POLICY "Anyone can view active listings" 
ON public.company_listings 
FOR SELECT 
USING (is_active = true);

-- Allow users to insert their own listings
CREATE POLICY "Users can create their own listings" 
ON public.company_listings 
FOR INSERT 
WITH CHECK (
  business_profile_id IN (
    SELECT id FROM public.business_profiles 
    WHERE user_id = auth.uid()
  )
);

-- Allow users to update their own listings
CREATE POLICY "Users can update their own listings" 
ON public.company_listings 
FOR UPDATE 
USING (
  business_profile_id IN (
    SELECT id FROM public.business_profiles 
    WHERE user_id = auth.uid()
  )
);

-- Allow users to delete their own listings
CREATE POLICY "Users can delete their own listings" 
ON public.company_listings 
FOR DELETE 
USING (
  business_profile_id IN (
    SELECT id FROM public.business_profiles 
    WHERE user_id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_listings_updated_at
BEFORE UPDATE ON public.company_listings
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();
