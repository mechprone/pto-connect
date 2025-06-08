-- =====================================================
-- PTO Connect Database - Clean Setup
-- =====================================================
-- This script will clean up any existing tables and create fresh ones
-- Run this in your Supabase SQL Editor

-- STEP 1: Clean up any existing tables and policies
-- =====================================================

-- Drop all policies first
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
DROP POLICY IF EXISTS "Admins can update their organization" ON organizations;
DROP POLICY IF EXISTS "Users can view profiles in their org" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles in their org" ON profiles;
DROP POLICY IF EXISTS "Users can view events in their org" ON events;
DROP POLICY IF EXISTS "Committee leads and above can manage events" ON events;
DROP POLICY IF EXISTS "Users can view RSVPs for events in their org" ON event_rsvps;
DROP POLICY IF EXISTS "Users can manage their own RSVPs" ON event_rsvps;
DROP POLICY IF EXISTS "Users can view transactions in their org" ON transactions;
DROP POLICY IF EXISTS "Board members and above can manage transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view fundraisers in their org" ON fundraisers;
DROP POLICY IF EXISTS "Committee leads and above can manage fundraisers" ON fundraisers;
DROP POLICY IF EXISTS "Users can view donations for fundraisers in their org" ON donations;
DROP POLICY IF EXISTS "Committee leads and above can manage donations" ON donations;
DROP POLICY IF EXISTS "Users can view teacher requests in their org" ON teacher_requests;
DROP POLICY IF EXISTS "Teachers can create and manage their own requests" ON teacher_requests;
DROP POLICY IF EXISTS "Users can view messages in their org" ON messages;
DROP POLICY IF EXISTS "Committee leads and above can manage messages" ON messages;
DROP POLICY IF EXISTS "Users can view their own message receipts" ON message_recipients;
DROP POLICY IF EXISTS "Users can update their own message receipts" ON message_recipients;
DROP POLICY IF EXISTS "Users can view documents in their org" ON documents;
DROP POLICY IF EXISTS "Committee leads and above can manage documents" ON documents;
DROP POLICY IF EXISTS "Users can view templates in their org" ON shared_templates;
DROP POLICY IF EXISTS "Committee leads and above can manage templates" ON shared_templates;
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Committee leads and above can create notifications" ON notifications;

-- Drop all tables in reverse dependency order
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS shared_templates CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS message_recipients CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS teacher_requests CASCADE;
DROP TABLE IF EXISTS donations CASCADE;
DROP TABLE IF EXISTS fundraisers CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS event_rsvps CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS get_user_org_id();
DROP FUNCTION IF EXISTS user_has_role(TEXT);
DROP FUNCTION IF EXISTS user_has_min_role(TEXT);
DROP FUNCTION IF EXISTS update_updated_at_column();

-- STEP 2: Enable UUID extension
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- STEP 3: Create all tables
-- =====================================================

-- ORGANIZATIONS (PTOs)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    signup_code TEXT UNIQUE NOT NULL,
    subscription_status TEXT CHECK (subscription_status IN ('trial', 'active', 'past_due', 'canceled', 'unpaid')) DEFAULT 'trial',
    trial_ends_at TIMESTAMP,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- PROFILES (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT CHECK (role IN ('admin', 'board_member', 'committee_lead', 'volunteer', 'parent_member', 'teacher')) NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    UNIQUE(email, org_id)
);

-- EVENTS
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    location TEXT,
    rsvp_limit INT,
    rsvp_count INT DEFAULT 0,
    template_used UUID,
    is_public BOOLEAN DEFAULT FALSE,
    status TEXT CHECK (status IN ('draft', 'published', 'cancelled')) DEFAULT 'draft',
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- EVENT RSVPs
CREATE TABLE event_rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('yes', 'no', 'maybe')) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT now(),
    UNIQUE(event_id, profile_id)
);

-- BUDGET TRANSACTIONS
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
    category TEXT,
    date DATE NOT NULL,
    description TEXT,
    receipt_url TEXT,
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMP,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP DEFAULT now()
);

-- FUNDRAISERS
CREATE TABLE fundraisers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    goal NUMERIC(10, 2),
    current_total NUMERIC(10, 2) DEFAULT 0,
    type TEXT CHECK (type IN ('donation', 'sales', 'pledge')) DEFAULT 'donation',
    stripe_price_id TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATE,
    end_date DATE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- FUNDRAISER DONATIONS
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fundraiser_id UUID REFERENCES fundraisers(id) ON DELETE CASCADE,
    donor_name TEXT,
    donor_email TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    stripe_payment_intent_id TEXT,
    status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
    is_anonymous BOOLEAN DEFAULT FALSE,
    message TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- TEACHER REQUESTS
CREATE TABLE teacher_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    estimated_cost NUMERIC(10, 2),
    status TEXT CHECK (status IN ('pending', 'approved', 'denied', 'completed')) DEFAULT 'pending',
    response TEXT,
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now()
);

-- COMMUNICATIONS/MESSAGES
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT CHECK (type IN ('email', 'sms', 'in_app', 'social')) NOT NULL,
    send_to_roles TEXT[],
    recipient_count INT DEFAULT 0,
    status TEXT CHECK (status IN ('draft', 'scheduled', 'sent', 'failed')) DEFAULT 'draft',
    scheduled_for TIMESTAMP,
    sent_at TIMESTAMP,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP DEFAULT now()
);

-- MESSAGE RECIPIENTS
CREATE TABLE message_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'read')) DEFAULT 'pending',
    sent_at TIMESTAMP,
    read_at TIMESTAMP,
    error_message TEXT
);

-- DOCUMENTS
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    category TEXT,
    file_url TEXT NOT NULL,
    file_size INT,
    file_type TEXT,
    access_roles TEXT[],
    is_public BOOLEAN DEFAULT FALSE,
    uploaded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP DEFAULT now()
);

-- SHARED TEMPLATES
CREATE TABLE shared_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('event', 'fundraiser', 'communication', 'budget')) NOT NULL,
    template_data JSONB NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    usage_count INT DEFAULT 0,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP DEFAULT now()
);

-- NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT CHECK (type IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
    action_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT now()
);

-- STEP 4: Create indexes
-- =====================================================
CREATE INDEX idx_profiles_org_id ON profiles(org_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_events_org_id ON events(org_id);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_transactions_org_id ON transactions(org_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_fundraisers_org_id ON fundraisers(org_id);
CREATE INDEX idx_teacher_requests_org_id ON teacher_requests(org_id);
CREATE INDEX idx_messages_org_id ON messages(org_id);
CREATE INDEX idx_documents_org_id ON documents(org_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- STEP 5: Create triggers
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fundraisers_updated_at BEFORE UPDATE ON fundraisers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- STEP 6: Enable RLS on all tables
-- =====================================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fundraisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- STEP 7: Create helper functions
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT org_id 
    FROM profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION user_has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = required_role
    FROM profiles 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION user_has_min_role(min_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  role_hierarchy TEXT[] := ARRAY['admin', 'board_member', 'committee_lead', 'volunteer', 'parent_member', 'teacher'];
  user_level INT;
  min_level INT;
BEGIN
  SELECT role INTO user_role FROM profiles WHERE id = auth.uid();
  
  SELECT array_position(role_hierarchy, user_role) INTO user_level;
  SELECT array_position(role_hierarchy, min_role) INTO min_level;
  
  RETURN user_level <= min_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 8: Create RLS policies
-- =====================================================

-- ORGANIZATIONS POLICIES
CREATE POLICY "Users can view their organization" ON organizations
  FOR SELECT USING (id = get_user_org_id());

CREATE POLICY "Admins can update their organization" ON organizations
  FOR UPDATE USING (id = get_user_org_id() AND user_has_role('admin'));

-- PROFILES POLICIES
CREATE POLICY "Users can view profiles in their org" ON profiles
  FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can manage all profiles in their org" ON profiles
  FOR ALL USING (org_id = get_user_org_id() AND user_has_role('admin'));

-- EVENTS POLICIES
CREATE POLICY "Users can view events in their org" ON events
  FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Committee leads and above can manage events" ON events
  FOR ALL USING (org_id = get_user_org_id() AND user_has_min_role('committee_lead'));

-- EVENT RSVPS POLICIES
CREATE POLICY "Users can view RSVPs for events in their org" ON event_rsvps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_rsvps.event_id 
      AND events.org_id = get_user_org_id()
    )
  );

CREATE POLICY "Users can manage their own RSVPs" ON event_rsvps
  FOR ALL USING (profile_id = auth.uid());

-- TRANSACTIONS POLICIES
CREATE POLICY "Users can view transactions in their org" ON transactions
  FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Board members and above can manage transactions" ON transactions
  FOR ALL USING (org_id = get_user_org_id() AND user_has_min_role('board_member'));

-- FUNDRAISERS POLICIES
CREATE POLICY "Users can view fundraisers in their org" ON fundraisers
  FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Committee leads and above can manage fundraisers" ON fundraisers
  FOR ALL USING (org_id = get_user_org_id() AND user_has_min_role('committee_lead'));

-- DONATIONS POLICIES
CREATE POLICY "Users can view donations for fundraisers in their org" ON donations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM fundraisers 
      WHERE fundraisers.id = donations.fundraiser_id 
      AND fundraisers.org_id = get_user_org_id()
    )
  );

CREATE POLICY "Committee leads and above can manage donations" ON donations
  FOR ALL USING (
    user_has_min_role('committee_lead') AND
    EXISTS (
      SELECT 1 FROM fundraisers 
      WHERE fundraisers.id = donations.fundraiser_id 
      AND fundraisers.org_id = get_user_org_id()
    )
  );

-- TEACHER REQUESTS POLICIES
CREATE POLICY "Users can view teacher requests in their org" ON teacher_requests
  FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Teachers can create and manage their own requests" ON teacher_requests
  FOR ALL USING (
    org_id = get_user_org_id() AND 
    (teacher_id = auth.uid() OR user_has_min_role('committee_lead'))
  );

-- MESSAGES POLICIES
CREATE POLICY "Users can view messages in their org" ON messages
  FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Committee leads and above can manage messages" ON messages
  FOR ALL USING (org_id = get_user_org_id() AND user_has_min_role('committee_lead'));

-- MESSAGE RECIPIENTS POLICIES
CREATE POLICY "Users can view their own message receipts" ON message_recipients
  FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "Users can update their own message receipts" ON message_recipients
  FOR UPDATE USING (recipient_id = auth.uid());

-- DOCUMENTS POLICIES
CREATE POLICY "Users can view documents in their org" ON documents
  FOR SELECT USING (
    org_id = get_user_org_id() AND
    (is_public = true OR 
     access_roles IS NULL OR 
     EXISTS (
       SELECT 1 FROM profiles 
       WHERE profiles.id = auth.uid() 
       AND profiles.role = ANY(access_roles)
     ))
  );

CREATE POLICY "Committee leads and above can manage documents" ON documents
  FOR ALL USING (org_id = get_user_org_id() AND user_has_min_role('committee_lead'));

-- SHARED TEMPLATES POLICIES
CREATE POLICY "Users can view templates in their org" ON shared_templates
  FOR SELECT USING (org_id = get_user_org_id() OR is_public = true);

CREATE POLICY "Committee leads and above can manage templates" ON shared_templates
  FOR ALL USING (org_id = get_user_org_id() AND user_has_min_role('committee_lead'));

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Committee leads and above can create notifications" ON notifications
  FOR INSERT WITH CHECK (org_id = get_user_org_id() AND user_has_min_role('committee_lead'));

-- STEP 9: Verification
-- =====================================================
SELECT 'Database setup completed successfully!' as status;

-- Verify tables exist
SELECT 'Tables created: ' || count(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('organizations', 'profiles', 'events', 'event_rsvps', 'transactions', 'fundraisers', 'donations', 'teacher_requests', 'messages', 'message_recipients', 'documents', 'shared_templates', 'notifications');

-- Verify RLS is enabled
SELECT 'Tables with RLS: ' || count(*) as rls_count
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;

-- Verify notifications table structure
SELECT 'Notifications table columns: ' || string_agg(column_name, ', ') as columns
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND table_schema = 'public';
