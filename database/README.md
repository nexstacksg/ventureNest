# VentureNest Database Setup Guide

This guide explains how to set up the Supabase database for the VentureNest application.

## Prerequisites

- A Supabase account
- Access to the Supabase project dashboard
- Basic knowledge of SQL and database concepts

## Setup Instructions

### 1. Create a New Supabase Project

1. Log in to your Supabase account at [https://app.supabase.io/](https://app.supabase.io/)
2. Click "New Project" and provide the required information:
   - Name: VentureNest
   - Database Password: Create a strong password
   - Region: Choose the region closest to your users
3. Click "Create new project" and wait for the setup to complete

### 2. Run the Schema SQL

1. In your Supabase project dashboard, navigate to the "SQL Editor" section
2. Click "New Query"
3. Copy the entire contents of the `schema.sql` file in this directory
4. Paste it into the SQL editor
5. Click "Run" to execute the SQL and create all tables, indexes, and functions

### 3. Set Up Storage Buckets

1. Navigate to the "Storage" section in your Supabase dashboard
2. Create the following buckets:
   - `profile-avatars`: For user profile pictures
   - `business-logos`: For company logos
   - `business-documents`: For business documents
   - `public-assets`: For publicly accessible assets

For each bucket, set the appropriate permissions:
- `profile-avatars`: Private (authenticated users can upload, only owner can download)
- `business-logos`: Public (authenticated users can upload, anyone can download)
- `business-documents`: Private (authenticated users can upload, only owner or approved users can download)
- `public-assets`: Public (authenticated users can upload, anyone can download)

### 4. Configure Authentication

1. Navigate to the "Authentication" section in your Supabase dashboard
2. Under "Settings", configure:
   - Site URL: Your application's URL
   - Redirect URLs: Add your application's redirect URLs
3. Enable the email provider and configure:
   - Confirm emails: Enabled
   - Secure email change: Enabled
   - Double confirm changes: Enabled

### 5. Set Up Realtime

1. Navigate to the "Database" section
2. Click on "Replication" in the sidebar
3. Enable realtime for the following tables:
   - profiles
   - business_profiles
   - listings
   - documents
   - access_requests
   - notifications
   - views_history

### 6. Update Environment Variables

Update your application's environment variables with the Supabase URL and anon key:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in the Supabase dashboard under "Settings" > "API".

## Database Schema Overview

The VentureNest database consists of the following tables:

1. **profiles**: Extends Supabase Auth users with additional profile information
2. **business_profiles**: Stores business information for entrepreneurs
3. **listings**: Stores business/equity listings created by entrepreneurs
4. **documents**: Stores business documents uploaded by entrepreneurs
5. **access_requests**: Tracks document access requests from investors
6. **notifications**: Stores user notifications
7. **views_history**: Tracks document views

## Row Level Security (RLS)

All tables have Row Level Security enabled to ensure data is only accessible to authorized users:

- Profiles: Users can view all profiles but only edit their own
- Business Profiles: Users can view all profiles but only edit their own
- Listings: Published listings are visible to everyone, but users can only manage their own
- Documents: Users can only see documents they own or have been granted access to
- Access Requests: Users can only see requests they've made or received
- Notifications: Users can only see their own notifications
- Views History: Document owners can see who viewed their documents

## Database Functions

The schema includes several helper functions:

1. `create_notification`: Creates a notification for a user
2. `create_access_request`: Creates a document access request with automatic notification
3. `update_access_request_status`: Updates an access request status and notifies the requester

## Triggers

The schema includes triggers for automatic notifications:

1. `after_listing_change`: Notifies users when their listing status changes to published

## Need Help?

If you encounter any issues or have questions about the database setup, please contact the development team.
