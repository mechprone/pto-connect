-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ORGANIZATIONS (PTOs)
CREATE TABLE organizations (
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
    UNIQUE(email, org_id) -- same email can exist in different orgs
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
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('yes', 'no', 'maybe')) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT now(),
    UNIQUE(event_id, user_id)
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
    send_to_roles TEXT[], -- array of roles to send to
    recipient_count INT DEFAULT 0,
    status TEXT CHECK (status IN ('draft', 'scheduled', 'sent', 'failed')) DEFAULT 'draft',
    scheduled_for TIMESTAMP,
    sent_at TIMESTAMP,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP DEFAULT now()
);

-- MESSAGE RECIPIENTS (for tracking individual sends)
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
    access_roles TEXT[], -- which roles can access this document
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
    is_public BOOLEAN DEFAULT FALSE, -- can other orgs use this template
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

-- INDEXES for performance
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

-- TRIGGERS for updated_at timestamps
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
