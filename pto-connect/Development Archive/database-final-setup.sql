-- =====================================================
-- PTO Connect Database - Final Setup (No Conflicts)
-- =====================================================
-- This script creates a fresh database without any cleanup
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CREATE TABLES
-- =====================================================

-- ORGANIZATIONS (PTOs)
CREATE TABLE IF NOT EXISTS organizations (
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
    UNIQUE(email, org_id)
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
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('yes', 'no', 'maybe')) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT now(),
    UNIQUE(event_id, profile_id)
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
    send_to_roles TEXT[],
    recipient_count INT DEFAULT 0,
    status TEXT CHECK (status IN ('draft', 'scheduled', 'sent', 'failed')) DEFAULT 'draft',
    scheduled_for TIMESTAMP,
    sent_at TIMESTAMP,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP DEFAULT now()
);

-- MESSAGE RECIPIENTS
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
    access_roles TEXT[],
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
    is_public BOOLEAN DEFAULT FALSE,
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
-- CREATE INDEXES
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
-- CREATE TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Only create triggers if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_organizations_updated_at') THEN
        CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
        CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_events_updated_at') THEN
        CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_fundraisers_updated_at') THEN
        CREATE TRIGGER update_fundraisers_updated_at BEFORE UPDATE ON fundraisers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =====================================================
-- ENABLE RLS
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

-- =====================================================
-- CREATE HELPER FUNCTIONS
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

-- =====================================================
-- CREATE RLS POLICIES (Only if they don't exist)
-- =====================================================

-- ORGANIZATIONS POLICIES
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'organizations' AND policyname = 'Users can view their organization') THEN
        CREATE POLICY "Users can view their organization" ON organizations
          FOR SELECT USING (id = get_user_org_id());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'organizations' AND policyname = 'Admins can update their organization') THEN
        CREATE POLICY "Admins can update their organization" ON organizations
          FOR UPDATE USING (id = get_user_org_id() AND user_has_role('admin'));
    END IF;
END $$;

-- PROFILES POLICIES
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view profiles in their org') THEN
        CREATE POLICY "Users can view profiles in their org" ON profiles
          FOR SELECT USING (org_id = get_user_org_id());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile') THEN
        CREATE POLICY "Users can update their own profile" ON profiles
          FOR UPDATE USING (id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins can manage all profiles in their org') THEN
        CREATE POLICY "Admins can manage all profiles in their org" ON profiles
          FOR ALL USING (org_id = get_user_org_id() AND user_has_role('admin'));
    END IF;
END $$;

-- EVENTS POLICIES
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Users can view events in their org') THEN
        CREATE POLICY "Users can view events in their org" ON events
          FOR SELECT USING (org_id = get_user_org_id());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Committee leads and above can manage events') THEN
        CREATE POLICY "Committee leads and above can manage events" ON events
          FOR ALL USING (org_id = get_user_org_id() AND user_has_min_role('committee_lead'));
    END IF;
END $$;

-- EVENT RSVPS POLICIES
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_rsvps' AND policyname = 'Users can view RSVPs for events in their org') THEN
        CREATE POLICY "Users can view RSVPs for events in their org" ON event_rsvps
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM events 
              WHERE events.id = event_rsvps.event_id 
              AND events.org_id = get_user_org_id()
            )
          );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'event_rsvps' AND policyname = 'Users can manage their own RSVPs') THEN
        CREATE POLICY "Users can manage their own RSVPs" ON event_rsvps
          FOR ALL USING (profile_id = auth.uid());
    END IF;
END $$;

-- NOTIFICATIONS POLICIES
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can view their own notifications') THEN
        CREATE POLICY "Users can view their own notifications" ON notifications
          FOR SELECT USING (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can update their own notifications') THEN
        CREATE POLICY "Users can update their own notifications" ON notifications
          FOR UPDATE USING (user_id = auth.uid());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Committee leads and above can create notifications') THEN
        CREATE POLICY "Committee leads and above can create notifications" ON notifications
          FOR INSERT WITH CHECK (org_id = get_user_org_id() AND user_has_min_role('committee_lead'));
    END IF;
END $$;

-- =====================================================
-- VERIFICATION
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
SELECT 'Notifications table columns: ' || string_agg(column_name, ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns 
WHERE table_name = 'notifications' 
AND table_schema = 'public';
