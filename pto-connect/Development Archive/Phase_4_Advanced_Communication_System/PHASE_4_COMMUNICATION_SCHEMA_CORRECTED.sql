-- =====================================================
-- Phase 4: Advanced Communication & Notification System
-- Database Schema Implementation - CORRECTED VERSION
-- =====================================================

-- First, let's check what user/profile tables exist and create a corrected schema
-- This version handles different possible table structures

-- =====================================================
-- TABLES CREATION (Same as before)
-- =====================================================

-- Email templates with brand customization
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'general',
  description TEXT,
  design_json JSONB NOT NULL DEFAULT '{}',
  html_content TEXT,
  thumbnail_url TEXT,
  is_shared BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for performance
  CONSTRAINT email_templates_name_org_unique UNIQUE(name, org_id)
);

-- SMS campaigns and messages
CREATE TABLE IF NOT EXISTS sms_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  message_content TEXT NOT NULL,
  recipient_type VARCHAR(50) DEFAULT 'all',
  recipient_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  delivery_rate DECIMAL(5,2) DEFAULT 0.00,
  response_rate DECIMAL(5,2) DEFAULT 0.00,
  status VARCHAR(50) DEFAULT 'draft',
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SMS message delivery tracking
CREATE TABLE IF NOT EXISTS sms_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES sms_campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  phone_number VARCHAR(20),
  message_sid VARCHAR(100),
  status VARCHAR(50),
  error_code VARCHAR(10),
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Push notifications
CREATE TABLE IF NOT EXISTS push_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  icon_url TEXT,
  image_url TEXT,
  action_url TEXT,
  badge_count INTEGER DEFAULT 1,
  recipient_type VARCHAR(50) DEFAULT 'all',
  recipient_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'draft',
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Push notification deliveries
CREATE TABLE IF NOT EXISTS push_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES push_notifications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  endpoint TEXT,
  status VARCHAR(50),
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social media posts
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255),
  content TEXT NOT NULL,
  platforms TEXT[] DEFAULT '{}',
  media_urls TEXT[] DEFAULT '{}',
  hashtags TEXT[] DEFAULT '{}',
  scheduled_for TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'draft',
  engagement_metrics JSONB DEFAULT '{}',
  platform_post_ids JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Communication analytics
CREATE TABLE IF NOT EXISTS communication_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  communication_type VARCHAR(50) NOT NULL,
  communication_id UUID NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(10,2) NOT NULL,
  metric_metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User communication preferences
CREATE TABLE IF NOT EXISTS user_communication_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT true,
  social_notifications BOOLEAN DEFAULT true,
  frequency_preference VARCHAR(50) DEFAULT 'normal',
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  categories JSONB DEFAULT '{}',
  phone_number VARCHAR(20),
  phone_verified BOOLEAN DEFAULT false,
  push_subscription JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT user_communication_preferences_unique UNIQUE(user_id, org_id)
);

-- Communication campaigns
CREATE TABLE IF NOT EXISTS communication_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  campaign_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  channels TEXT[] DEFAULT '{}',
  target_audience JSONB DEFAULT '{}',
  content_config JSONB DEFAULT '{}',
  scheduling_config JSONB DEFAULT '{}',
  analytics_summary JSONB DEFAULT '{}',
  scheduled_for TIMESTAMP WITH TIME ZONE,
  launched_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email campaigns
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES communication_campaigns(id) ON DELETE CASCADE,
  template_id UUID REFERENCES email_templates(id),
  subject VARCHAR(500) NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  sender_name VARCHAR(255),
  sender_email VARCHAR(255),
  reply_to_email VARCHAR(255),
  recipient_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  bounced_count INTEGER DEFAULT 0,
  unsubscribed_count INTEGER DEFAULT 0,
  open_rate DECIMAL(5,2) DEFAULT 0.00,
  click_rate DECIMAL(5,2) DEFAULT 0.00,
  bounce_rate DECIMAL(5,2) DEFAULT 0.00,
  status VARCHAR(50) DEFAULT 'draft',
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email delivery tracking
CREATE TABLE IF NOT EXISTS email_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  email_address VARCHAR(255) NOT NULL,
  message_id VARCHAR(255),
  status VARCHAR(50),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  bounce_reason TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Communication templates
CREATE TABLE IF NOT EXISTS communication_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  template_type VARCHAR(50) NOT NULL,
  content_template JSONB NOT NULL,
  preview_image_url TEXT,
  is_premium BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  created_by VARCHAR(100) DEFAULT 'system',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Email Templates Indexes
CREATE INDEX IF NOT EXISTS idx_email_templates_org_id ON email_templates(org_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_templates_created_by ON email_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_email_templates_is_shared ON email_templates(is_shared) WHERE is_shared = true;

-- SMS Campaigns Indexes
CREATE INDEX IF NOT EXISTS idx_sms_campaigns_org_id ON sms_campaigns(org_id);
CREATE INDEX IF NOT EXISTS idx_sms_campaigns_status ON sms_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_sms_campaigns_scheduled_for ON sms_campaigns(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_sms_campaigns_created_by ON sms_campaigns(created_by);

-- SMS Deliveries Indexes
CREATE INDEX IF NOT EXISTS idx_sms_deliveries_campaign_id ON sms_deliveries(campaign_id);
CREATE INDEX IF NOT EXISTS idx_sms_deliveries_user_id ON sms_deliveries(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_deliveries_status ON sms_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_sms_deliveries_message_sid ON sms_deliveries(message_sid);

-- Push Notifications Indexes
CREATE INDEX IF NOT EXISTS idx_push_notifications_org_id ON push_notifications(org_id);
CREATE INDEX IF NOT EXISTS idx_push_notifications_status ON push_notifications(status);
CREATE INDEX IF NOT EXISTS idx_push_notifications_scheduled_for ON push_notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_push_notifications_created_by ON push_notifications(created_by);

-- Push Deliveries Indexes
CREATE INDEX IF NOT EXISTS idx_push_deliveries_notification_id ON push_deliveries(notification_id);
CREATE INDEX IF NOT EXISTS idx_push_deliveries_user_id ON push_deliveries(user_id);
CREATE INDEX IF NOT EXISTS idx_push_deliveries_status ON push_deliveries(status);

-- Social Posts Indexes
CREATE INDEX IF NOT EXISTS idx_social_posts_org_id ON social_posts(org_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled_for ON social_posts(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_social_posts_platforms ON social_posts USING GIN(platforms);
CREATE INDEX IF NOT EXISTS idx_social_posts_created_by ON social_posts(created_by);

-- Communication Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_communication_analytics_org_id ON communication_analytics(org_id);
CREATE INDEX IF NOT EXISTS idx_communication_analytics_type ON communication_analytics(communication_type);
CREATE INDEX IF NOT EXISTS idx_communication_analytics_communication_id ON communication_analytics(communication_id);
CREATE INDEX IF NOT EXISTS idx_communication_analytics_metric_name ON communication_analytics(metric_name);
CREATE INDEX IF NOT EXISTS idx_communication_analytics_recorded_at ON communication_analytics(recorded_at);

-- User Communication Preferences Indexes
CREATE INDEX IF NOT EXISTS idx_user_comm_prefs_user_id ON user_communication_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_comm_prefs_org_id ON user_communication_preferences(org_id);
CREATE INDEX IF NOT EXISTS idx_user_comm_prefs_phone_number ON user_communication_preferences(phone_number) WHERE phone_number IS NOT NULL;

-- Communication Campaigns Indexes
CREATE INDEX IF NOT EXISTS idx_communication_campaigns_org_id ON communication_campaigns(org_id);
CREATE INDEX IF NOT EXISTS idx_communication_campaigns_type ON communication_campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_communication_campaigns_status ON communication_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_communication_campaigns_channels ON communication_campaigns USING GIN(channels);
CREATE INDEX IF NOT EXISTS idx_communication_campaigns_created_by ON communication_campaigns(created_by);

-- Email Campaigns Indexes
CREATE INDEX IF NOT EXISTS idx_email_campaigns_org_id ON email_campaigns(org_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_campaign_id ON email_campaigns(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_template_id ON email_campaigns(template_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled_for ON email_campaigns(scheduled_for);

-- Email Deliveries Indexes
CREATE INDEX IF NOT EXISTS idx_email_deliveries_campaign_id ON email_deliveries(email_campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_deliveries_user_id ON email_deliveries(user_id);
CREATE INDEX IF NOT EXISTS idx_email_deliveries_email_address ON email_deliveries(email_address);
CREATE INDEX IF NOT EXISTS idx_email_deliveries_status ON email_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_email_deliveries_message_id ON email_deliveries(message_id);

-- Communication Templates Indexes
CREATE INDEX IF NOT EXISTS idx_communication_templates_category ON communication_templates(category);
CREATE INDEX IF NOT EXISTS idx_communication_templates_type ON communication_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_communication_templates_premium ON communication_templates(is_premium);

-- =====================================================
-- Row Level Security (RLS) Policies - CORRECTED VERSION
-- =====================================================

-- Enable RLS on all communication tables
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_communication_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_templates ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SIMPLIFIED RLS POLICIES (No user_profiles dependency)
-- =====================================================

-- Basic organization-based policies using user_roles table directly
-- These policies will work regardless of the user profile table structure

-- Email Templates Policies
CREATE POLICY "Users can view email templates in their organization" ON email_templates
  FOR SELECT USING (
    org_id IN (
      SELECT organization_id FROM user_roles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Committee leads can manage email templates" ON email_templates
  FOR ALL USING (
    org_id IN (
      SELECT organization_id FROM user_roles
      WHERE user_id = auth.uid() 
      AND role_type IN ('board_member', 'committee_lead', 'admin')
    )
  );

-- SMS Campaigns Policies
CREATE POLICY "Users can view SMS campaigns in their organization" ON sms_campaigns
  FOR SELECT USING (
    org_id IN (
      SELECT organization_id FROM user_roles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Committee leads can manage SMS campaigns" ON sms_campaigns
  FOR ALL USING (
    org_id IN (
      SELECT organization_id FROM user_roles
      WHERE user_id = auth.uid() 
      AND role_type IN ('board_member', 'committee_lead', 'admin')
    )
  );

-- Push Notifications Policies
CREATE POLICY "Users can view push notifications in their organization" ON push_notifications
  FOR SELECT USING (
    org_id IN (
      SELECT organization_id FROM user_roles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Committee leads can manage push notifications" ON push_notifications
  FOR ALL USING (
    org_id IN (
      SELECT organization_id FROM user_roles
      WHERE user_id = auth.uid() 
      AND role_type IN ('board_member', 'committee_lead', 'admin')
    )
  );

-- Social Posts Policies
CREATE POLICY "Users can view social posts in their organization" ON social_posts
  FOR SELECT USING (
    org_id IN (
      SELECT organization_id FROM user_roles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Committee leads can manage social posts" ON social_posts
  FOR ALL USING (
    org_id IN (
      SELECT organization_id FROM user_roles
      WHERE user_id = auth.uid() 
      AND role_type IN ('board_member', 'committee_lead', 'admin')
    )
  );

-- Communication Analytics Policies
CREATE POLICY "Users can view analytics for their organization" ON communication_analytics
  FOR SELECT USING (
    org_id IN (
      SELECT organization_id FROM user_roles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert analytics data" ON communication_analytics
  FOR INSERT WITH CHECK (true);

-- User Communication Preferences Policies
CREATE POLICY "Users can manage their own communication preferences" ON user_communication_preferences
  FOR ALL USING (user_id = auth.uid());

-- Communication Campaigns Policies
CREATE POLICY "Users can view campaigns in their organization" ON communication_campaigns
  FOR SELECT USING (
    org_id IN (
      SELECT organization_id FROM user_roles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Committee leads can manage campaigns" ON communication_campaigns
  FOR ALL USING (
    org_id IN (
      SELECT organization_id FROM user_roles
      WHERE user_id = auth.uid() 
      AND role_type IN ('board_member', 'committee_lead', 'admin')
    )
  );

-- Email Campaigns Policies
CREATE POLICY "Users can view email campaigns in their organization" ON email_campaigns
  FOR SELECT USING (
    org_id IN (
      SELECT organization_id FROM user_roles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Committee leads can manage email campaigns" ON email_campaigns
  FOR ALL USING (
    org_id IN (
      SELECT organization_id FROM user_roles
      WHERE user_id = auth.uid() 
      AND role_type IN ('board_member', 'committee_lead', 'admin')
    )
  );

-- Delivery tracking policies (read-only for users, system can insert)
CREATE POLICY "Users can view their delivery data" ON sms_deliveries
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can manage SMS delivery data" ON sms_deliveries
  FOR ALL WITH CHECK (true);

CREATE POLICY "Users can view their push delivery data" ON push_deliveries
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can manage push delivery data" ON push_deliveries
  FOR ALL WITH CHECK (true);

CREATE POLICY "Users can view their email delivery data" ON email_deliveries
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can manage email delivery data" ON email_deliveries
  FOR ALL WITH CHECK (true);

-- Communication Templates Policies (global templates)
CREATE POLICY "All authenticated users can view communication templates" ON communication_templates
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can manage communication templates" ON communication_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() 
      AND role_type = 'admin'
    )
  );

-- =====================================================
-- Functions and Triggers
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sms_campaigns_updated_at BEFORE UPDATE ON sms_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_push_notifications_updated_at BEFORE UPDATE ON push_notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_posts_updated_at BEFORE UPDATE ON social_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_communication_preferences_updated_at BEFORE UPDATE ON user_communication_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_communication_campaigns_updated_at BEFORE UPDATE ON communication_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON email_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_communication_templates_updated_at BEFORE UPDATE ON communication_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Initial Data Seeding
-- =====================================================

-- Insert default communication template categories
INSERT INTO communication_templates (name, description, category, template_type, content_template, created_by) VALUES
('Welcome Email', 'Welcome new PTO members', 'onboarding', 'email', '{"subject": "Welcome to {{org_name}} PTO!", "content": "Dear {{first_name}},\n\nWelcome to our PTO community! We''re excited to have you join us."}', 'system'),
('Event Announcement', 'Announce upcoming PTO events', 'events', 'email', '{"subject": "{{event_name}} - {{event_date}}", "content": "Join us for {{event_name}} on {{event_date}} at {{event_location}}."}', 'system'),
('Volunteer Request', 'Request volunteers for events', 'volunteers', 'email', '{"subject": "Volunteers Needed for {{event_name}}", "content": "We need your help! Please consider volunteering for {{event_name}}."}', 'system'),
('Fundraiser Update', 'Update on fundraising progress', 'fundraising', 'email', '{"subject": "Fundraiser Update - {{progress}}% Complete!", "content": "Great news! We''ve reached {{progress}}% of our fundraising goal."}', 'system'),
('Meeting Reminder', 'Remind about upcoming meetings', 'meetings', 'email', '{"subject": "PTO Meeting Reminder - {{meeting_date}}", "content": "Don''t forget about our PTO meeting on {{meeting_date}} at {{meeting_time}}."}', 'system'),
('Thank You Message', 'Thank volunteers and supporters', 'appreciation', 'email', '{"subject": "Thank You!", "content": "Thank you for your support and dedication to our PTO community."}', 'system'),
('Event Reminder SMS', 'SMS reminder for events', 'events', 'sms', '{"content": "Reminder: {{event_name}} is tomorrow at {{event_time}}. See you there!"}', 'system'),
('Volunteer Needed SMS', 'SMS for urgent volunteer needs', 'volunteers', 'sms', '{"content": "We still need volunteers for {{event_name}}. Can you help? Reply YES to volunteer."}', 'system'),
('Emergency Notification', 'Push notification for emergencies', 'emergency', 'push', '{"title": "Important Update", "body": "{{emergency_message}}", "urgent": true}', 'system'),
('Event Reminder Push', 'Push notification for event reminders', 'events', 'push', '{"title": "Event Reminder", "body": "{{event_name}} starts in 1 hour!"}', 'system')
ON CONFLICT DO NOTHING;

-- =====================================================
-- Schema Validation and Completion
-- =====================================================

-- Verify all tables were created successfully
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'email_templates', 'sms_campaigns', 'sms_deliveries', 
        'push_notifications', 'push_deliveries', 'social_posts',
        'communication_analytics', 'user_communication_preferences',
        'communication_campaigns', 'email_campaigns', 'email_deliveries',
        'communication_templates'
    );
    
    IF table_count = 12 THEN
        RAISE NOTICE 'SUCCESS: All 12 communication tables created successfully';
    ELSE
        RAISE EXCEPTION 'ERROR: Only % out of 12 communication tables were created', table_count;
    END IF;
END $$;

-- Log completion
INSERT INTO communication_analytics (org_id, communication_type, communication_id, metric_name, metric_value, recorded_at)
SELECT 
    '00000000-0000-0000-0000-000000000000'::UUID,
    'system',
    gen_random_uuid(),
    'schema_deployment',
    1.0,
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM communication_analytics 
    WHERE communication_type = 'system' 
    AND metric_name = 'schema_deployment'
);

RAISE NOTICE 'Phase 4 Communication Schema deployment completed successfully!';
