-- VentureNest Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles Table (extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  phone_number TEXT,
  is_entrepreneur BOOLEAN DEFAULT TRUE,
  is_investor BOOLEAN DEFAULT FALSE,
  notification_preferences JSONB DEFAULT '{"email": true, "push": true, "in_app": true}'::jsonb
);

-- Business Profiles Table
CREATE TABLE IF NOT EXISTS business_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  industry_tags TEXT[] DEFAULT '{}',
  website_url TEXT,
  social_media JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON business_profiles(user_id);

-- Listings Table
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_profile_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  is_full_company BOOLEAN NOT NULL,
  asking_price DECIMAL(15, 2),
  equity_percentage DECIMAL(5, 2),
  company_valuation DECIMAL(15, 2),
  annual_revenue DECIMAL(15, 2),
  annual_profit DECIMAL(15, 2),
  established_year INTEGER,
  employee_count INTEGER,
  location TEXT,
  industry TEXT,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, published, under_review, sold
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on business_profile_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_listings_business_profile_id ON listings(business_profile_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_profile_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  document_type TEXT NOT NULL, -- pitch_deck, financial_statement, business_plan, market_analysis, other
  is_confidential BOOLEAN DEFAULT FALSE,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on business_profile_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_documents_business_profile_id ON documents(business_profile_id);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON documents(document_type);

-- Access Requests Table
CREATE TABLE IF NOT EXISTS access_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_access_requests_document_id ON access_requests(document_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_requester_id ON access_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_owner_id ON access_requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(status);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- document_request, document_approved, listing_interest, message, system
  is_read BOOLEAN DEFAULT FALSE,
  related_id UUID, -- Can reference a document, listing, or access request
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Views History Table (for tracking document views)
CREATE TABLE IF NOT EXISTS views_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_views_history_document_id ON views_history(document_id);
CREATE INDEX IF NOT EXISTS idx_views_history_viewer_id ON views_history(viewer_id);
CREATE INDEX IF NOT EXISTS idx_views_history_viewed_at ON views_history(viewed_at);

-- Create RLS (Row Level Security) Policies

-- Profiles: Users can read all profiles but only update their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" 
  ON profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Business Profiles: Users can read all business profiles but only update their own
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business profiles are viewable by everyone" 
  ON business_profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own business profile" 
  ON business_profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business profile" 
  ON business_profiles FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own business profile" 
  ON business_profiles FOR DELETE 
  USING (auth.uid() = user_id);

-- Listings: Users can read all published listings but only manage their own
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published listings are viewable by everyone" 
  ON listings FOR SELECT 
  USING (status = 'published' OR EXISTS (
    SELECT 1 FROM business_profiles bp 
    WHERE bp.id = business_profile_id AND bp.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own listings" 
  ON listings FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM business_profiles bp 
    WHERE bp.id = business_profile_id AND bp.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own listings" 
  ON listings FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM business_profiles bp 
    WHERE bp.id = business_profile_id AND bp.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own listings" 
  ON listings FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM business_profiles bp 
    WHERE bp.id = business_profile_id AND bp.user_id = auth.uid()
  ));

-- Documents: Users can only see documents they own or have been granted access to
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own documents" 
  ON documents FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM business_profiles bp 
    WHERE bp.id = business_profile_id AND bp.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM access_requests ar 
    WHERE ar.document_id = id AND ar.requester_id = auth.uid() AND ar.status = 'approved'
  ));

CREATE POLICY "Users can insert their own documents" 
  ON documents FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM business_profiles bp 
    WHERE bp.id = business_profile_id AND bp.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own documents" 
  ON documents FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM business_profiles bp 
    WHERE bp.id = business_profile_id AND bp.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own documents" 
  ON documents FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM business_profiles bp 
    WHERE bp.id = business_profile_id AND bp.user_id = auth.uid()
  ));

-- Access Requests: Users can see requests they've made or received
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view access requests they're involved in" 
  ON access_requests FOR SELECT 
  USING (requester_id = auth.uid() OR owner_id = auth.uid());

CREATE POLICY "Users can insert access requests" 
  ON access_requests FOR INSERT 
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Owners can update access request status" 
  ON access_requests FOR UPDATE 
  USING (owner_id = auth.uid());

-- Notifications: Users can only see their own notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" 
  ON notifications FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" 
  ON notifications FOR UPDATE 
  USING (user_id = auth.uid());

-- Views History: Document owners can see who viewed their documents
ALTER TABLE views_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Document owners can view the history" 
  ON views_history FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM documents d 
    JOIN business_profiles bp ON d.business_profile_id = bp.id 
    WHERE d.id = document_id AND bp.user_id = auth.uid()
  ));

CREATE POLICY "Viewers can insert view records" 
  ON views_history FOR INSERT 
  WITH CHECK (viewer_id = auth.uid());

-- Create functions for common operations

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT,
  p_related_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, title, message, type, related_id)
  VALUES (p_user_id, p_title, p_message, p_type, p_related_id)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle access request creation with notification
CREATE OR REPLACE FUNCTION create_access_request(
  p_document_id UUID,
  p_requester_id UUID,
  p_message TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_owner_id UUID;
  v_document_name TEXT;
  v_request_id UUID;
BEGIN
  -- Get the document owner
  SELECT bp.user_id, d.name INTO v_owner_id, v_document_name
  FROM documents d
  JOIN business_profiles bp ON d.business_profile_id = bp.id
  WHERE d.id = p_document_id;
  
  -- Create the access request
  INSERT INTO access_requests (document_id, requester_id, owner_id, message)
  VALUES (p_document_id, p_requester_id, v_owner_id, p_message)
  RETURNING id INTO v_request_id;
  
  -- Create notification for the document owner
  PERFORM create_notification(
    v_owner_id,
    'New Document Access Request',
    'Someone has requested access to your document: ' || v_document_name,
    'document_request',
    v_request_id
  );
  
  RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle access request approval/rejection with notification
CREATE OR REPLACE FUNCTION update_access_request_status(
  p_request_id UUID,
  p_status TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_document_id UUID;
  v_document_name TEXT;
  v_requester_id UUID;
  v_notification_title TEXT;
  v_notification_message TEXT;
  v_notification_type TEXT;
BEGIN
  -- Get the request details
  SELECT ar.document_id, d.name, ar.requester_id
  INTO v_document_id, v_document_name, v_requester_id
  FROM access_requests ar
  JOIN documents d ON ar.document_id = d.id
  WHERE ar.id = p_request_id;
  
  -- Update the request status
  UPDATE access_requests
  SET status = p_status, updated_at = NOW()
  WHERE id = p_request_id;
  
  -- Set notification details based on status
  IF p_status = 'approved' THEN
    v_notification_title := 'Access Request Approved';
    v_notification_message := 'Your request to access the document "' || v_document_name || '" has been approved.';
    v_notification_type := 'document_approved';
  ELSE
    v_notification_title := 'Access Request Rejected';
    v_notification_message := 'Your request to access the document "' || v_document_name || '" has been rejected.';
    v_notification_type := 'document_rejected';
  END IF;
  
  -- Create notification for the requester
  PERFORM create_notification(
    v_requester_id,
    v_notification_title,
    v_notification_message,
    v_notification_type,
    v_document_id
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new listing notifications
CREATE OR REPLACE FUNCTION notify_new_listing() RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_company_name TEXT;
BEGIN
  -- Get the business profile owner and company name
  SELECT bp.user_id, bp.company_name INTO v_user_id, v_company_name
  FROM business_profiles bp
  WHERE bp.id = NEW.business_profile_id;
  
  -- Only create notification if status is changed to published
  IF NEW.status = 'published' AND (TG_OP = 'INSERT' OR OLD.status != 'published') THEN
    -- Notify the owner that their listing is now public
    PERFORM create_notification(
      v_user_id,
      'Listing Published',
      'Your listing "' || NEW.title || '" for ' || v_company_name || ' is now public.',
      'listing_published',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER after_listing_change
AFTER INSERT OR UPDATE ON listings
FOR EACH ROW
EXECUTE FUNCTION notify_new_listing();

-- Create initial triggers for realtime subscriptions
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE 
  profiles, 
  business_profiles, 
  listings, 
  documents, 
  access_requests, 
  notifications, 
  views_history;
