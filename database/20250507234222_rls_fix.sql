-- Fix for RLS policy violation on profiles table
-- Run this in the Supabase SQL Editor

-- First, enable RLS on the profiles table if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can do all operations" ON profiles;

-- Create a policy that allows users to insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create a policy that allows users to update their own profile
CREATE POLICY "Users can update their own profile" 
ON profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Create a policy that allows users to view all profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON profiles 
FOR SELECT 
USING (true);

-- Create a policy that allows users to delete their own profile
CREATE POLICY "Users can delete their own profile" 
ON profiles 
FOR DELETE 
USING (auth.uid() = id);

-- Add a policy to allow the service role to bypass RLS
-- This is useful for server-side operations
CREATE POLICY "Service role can do all operations" 
ON profiles 
USING (auth.role() = 'service_role');
