-- =====================================================
-- PTO Connect Database Setup - Complete Migration
-- =====================================================
-- Run this script in your Supabase SQL Editor
-- This combines schema-updated.sql and rls-policies-updated.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- ORGANIZATIONS (PTOs)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- for URLs like app.ptoconnect.com/pto/[slug]
    signup_code TEXT UNIQUE NOT NULL, -- unique code for joining this PTO
    subscription_status TEXT CHECK (subscription_status IN ('trial', 'active', 'past_due', 'canceled', 'unpaid')) DEFAULT 'trial',
    trial_ends_at TIMESTAMP,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    settings JSONB DEFAULT '{}', -- for custom PTO settings
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- PROFILES (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
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
    UNIQUE(email, org_id) -- same email can exist in different orgs
);

-- EVENTS
CREATE TABLE IF NOT EXISTS events (
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
CREATE TABLE IF NOT EXISTS event_rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('yes', 'no', 'maybe')) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT now(),
    UNIQUE(event_id, user_id)
);

-- BUDGET TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
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
CREATE TABLE IF NOT EXISTS fundraisers (
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
CREATE TABLE IF NOT EXISTS donations (
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
CREATE TABLE IF NOT EXISTS teacher_requests (
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
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT CHECK (type IN ('email', 'sms', 'in_app', 'social')) NOT NULL,
    send_to_roles TEXT[], -- array of roles to send to
    recipient_count INT DEFAULT 0,
    status TEXT CHECK (status IN ('draft', 'scheduled', 'sent', 'failed')) DEFAULT 'draft',
    scheduled_for TIMESTAMP,
    sent_at TIMESTAMP,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP DEFAULT now()
);

-- MESSAGE RECIPIENTS (for tracking individual sends)
CREATE TABLE IF NOT EXISTS message_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'read')) DEFAULT 'pending',
    sent_at TIMESTAMP,
    read_at TIMESTAMP,
    error_message TEXT
);

-- DOCUMENTS
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    category TEXT,
    file_url TEXT NOT NULL,
    file_size INT,
    file_type TEXT,
    access_roles TEXT[], -- which roles can access this document
    is_public BOOLEAN DEFAULT FALSE,
    uploaded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP DEFAULT now()
);

-- SHARED TEMPLATES
CREATE TABLE IF NOT EXISTS shared_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('event', 'fundraiser', 'communication', 'budget')) NOT NULL,
    template_data JSONB NOT NULL,
    is_public BOOLEAN DEFAULT FALSE, -- can other orgs use this template
    usage_count INT DEFAULT 0,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP DEFAULT now()
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
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

-- =====================================================
-- INDEXES for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_profiles_org_id ON profiles(org_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_events_org_id ON events(org_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_transactions_org_id ON transactions(org_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_fundraisers_org_id ON fundraisers(org_id);
CREATE INDEX IF NOT EXISTS idx_teacher_requests_org_id ON teacher_requests(org_id);
CREATE INDEX IF NOT EXISTS idx_messages_org_id ON messages(org_id);
CREATE INDEX IF NOT EXISTS idx_documents_org_id ON documents(org_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- =====================================================
-- TRIGGERS for updated_at timestamps
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fundraisers_updated_at ON fundraisers;
CREATE TRIGGER update_fundraisers_updated_at BEFORE UPDATE ON fundraisers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
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

-- Helper function to get user's organization ID
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

-- Helper function to check if user has role
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

-- Helper function to check if user has minimum role level
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

-- =====================================================
-- ORGANIZATIONS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
CREATE POLICY "Users can view their organization" ON organizations
  FOR SELECT USING (id = get_user_org_id());

DROP POLICY IF EXISTS "Admins can update their organization" ON organizations;
CREATE POLICY "Admins can update their organization" ON organizations
  FOR UPDATE USING (id = get_user_org_id() AND user_has_role('admin'));

-- =====================================================
-- PROFILES POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view profiles in their org" ON profiles;
CREATE POLICY "Users can view profiles in their org" ON profiles
  FOR SELECT USING (org_id = get_user_org_id());

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all profiles in their org" ON profiles;
CREATE POLICY "Admins can manage all profiles in their org" ON profiles
  FOR ALL USING (org_id = get_user_org_id() AND user_has_role('admin'));

-- =====================================================
-- EVENTS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view events in their org" ON events;
CREATE POLICY "Users can view events in their org" ON events
  FOR SELECT USING (org_id = get_user_org_id());

DROP POLICY IF EXISTS "Committee leads and above can manage events" ON events;
CREATE POLICY "Committee leads and above can manage events" ON events
  FOR ALL USING (org_id = get_user_org_id() AND user_has_min_role('committee_lead'));

-- =====================================================
-- EVENT RSVPS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view RSVPs for events in their org" ON event_rsvps;
CREATE POLICY "Users can view RSVPs for events in their org" ON event_rsvps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events 
      WHERE events.id = event_rsvps.event_id 
      AND events.org_id = get_user_org_id()
    )
  );

DROP POLICY IF EXISTS "Users can manage their own RSVPs" ON event_rsvps;
CREATE POLICY "Users can manage their own RSVPs" ON event_rsvps
  FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- TRANSACTIONS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view transactions in their org" ON transactions;
CREATE POLICY "Users can view transactions in their org" ON transactions
  FOR SELECT USING (org_id = get_user_org_id());

DROP POLICY IF EXISTS "Board members and above can manage transactions" ON transactions;
CREATE POLICY "Board members and above can manage transactions" ON transactions
  FOR ALL USING (org_id = get_user_org_id() AND user_has_min_role('board_member'));

-- =====================================================
-- FUNDRAISERS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view fundraisers in their org" ON fundraisers;
CREATE POLICY "Users can view fundraisers in their org" ON fundraisers
  FOR SELECT USING (org_id = get_user_org_id());

DROP POLICY IF EXISTS "Committee leads and above can manage fundraisers" ON fundraisers;
CREATE POLICY "Committee leads and above can manage fundraisers" ON fundraisers
  FOR ALL USING (org_id = get_user_org_id() AND user_has_min_role('committee_lead'));

-- =====================================================
-- DONATIONS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view donations for fundraisers in their org" ON donations;
CREATE POLICY "Users can view donations for fundraisers in their org" ON donations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM fundraisers 
      WHERE fundraisers.id = donations.fundraiser_id 
      AND fundraisers.org_id = get_user_org_id()
    )
  );

DROP POLICY IF EXISTS "Committee leads and above can manage donations" ON donations;
CREATE POLICY "Committee leads and above can manage donations" ON donations
  FOR ALL USING (
    user_has_min_role('committee_lead') AND
    EXISTS (
      SELECT 1 FROM fundraisers 
      WHERE fundraisers.id = donations.fundraiser_id 
      AND fundraisers.org_id = get_user_org_id()
    )
  );

-- =====================================================
-- TEACHER REQUESTS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view teacher requests in their org" ON teacher_requests;
CREATE POLICY "Users can view teacher requests in their org" ON teacher_requests
  FOR SELECT USING (org_id = get_user_org_id());

DROP POLICY IF EXISTS "Teachers can create and manage their own requests" ON teacher_requests;
CREATE POLICY "Teachers can create and manage their own requests" ON teacher_requests
  FOR ALL USING (
    org_id = get_user_org_id() AND 
    (teacher_id = auth.uid() OR user_has_min_role('committee_lead'))
  );

-- =====================================================
-- MESSAGES POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view messages in their org" ON messages;
CREATE POLICY "Users can view messages in their org" ON messages
  FOR SELECT USING (org_id = get_user_org_id());

DROP POLICY IF EXISTS "Committee leads and above can manage messages" ON messages;
CREATE POLICY "Committee leads and above can manage messages" ON messages
  FOR ALL USING (org_id = get_user_org_id() AND user_has_min_role('committee_lead'));

-- =====================================================
-- MESSAGE RECIPIENTS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own message receipts" ON message_recipients;
CREATE POLICY "Users can view their own message receipts" ON message_recipients
  FOR SELECT USING (recipient_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own message receipts" ON message_recipients;
CREATE POLICY "Users can update their own message receipts" ON message_recipients
  FOR UPDATE USING (recipient_id = auth.uid());

-- =====================================================
-- DOCUMENTS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view documents in their org" ON documents;
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

DROP POLICY IF EXISTS "Committee leads and above can manage documents" ON documents;
CREATE POLICY "Committee leads and above can manage documents" ON documents
  FOR ALL USING (org_id = get_user_org_id() AND user_has_min_role('committee_lead'));

-- =====================================================
-- SHARED TEMPLATES POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view templates in their org" ON shared_templates;
CREATE POLICY "Users can view templates in their org" ON shared_templates
  FOR SELECT USING (org_id = get_user_org_id() OR is_public = true);

DROP POLICY IF EXISTS "Committee leads and above can manage templates" ON shared_templates;
CREATE POLICY "Committee leads and above can manage templates" ON shared_templates
  FOR ALL USING (org_id = get_user_org_id() AND user_has_min_role('committee_lead'));

-- =====================================================
-- NOTIFICATIONS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Committee leads and above can create notifications" ON notifications;
CREATE POLICY "Committee leads and above can create notifications" ON notifications
  FOR INSERT WITH CHECK (org_id = get_user_org_id() AND user_has_min_role('committee_lead'));

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- Insert a test organization for development (optional)
-- INSERT INTO organizations (name, slug, signup_code, subscription_status, trial_ends_at, settings)
-- VALUES (
--   'Test Elementary PTO',
--   'test-elementary-pto',
--   'TEST123',
--   'trial',
--   now() + interval '14 days',
--   '{"school_name": "Test Elementary School"}'
-- );

SELECT 'Database setup completed successfully!' as status;
