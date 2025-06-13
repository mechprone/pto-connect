-- Fundraiser Module Enhancements
-- Migration: Add new tables and columns for enhanced fundraiser functionality

-- Create Fundraiser Categories table
CREATE TABLE IF NOT EXISTS fundraiser_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- Create Donation Tiers table
CREATE TABLE IF NOT EXISTS donation_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fundraiser_id UUID REFERENCES fundraisers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT,
    benefits TEXT[],
    created_at TIMESTAMP DEFAULT now()
);

-- Create Campaign Analytics table
CREATE TABLE IF NOT EXISTS fundraiser_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fundraiser_id UUID REFERENCES fundraisers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    views INT DEFAULT 0,
    unique_visitors INT DEFAULT 0,
    shares INT DEFAULT 0,
    conversion_rate NUMERIC(5, 2),
    created_at TIMESTAMP DEFAULT now()
);

-- Create Social Shares table
CREATE TABLE IF NOT EXISTS fundraiser_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fundraiser_id UUID REFERENCES fundraisers(id) ON DELETE CASCADE,
    platform TEXT CHECK (platform IN ('facebook', 'twitter', 'email', 'link')),
    shared_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP DEFAULT now()
);

-- Enhance fundraisers table
ALTER TABLE fundraisers
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES fundraiser_categories(id),
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('draft', 'active', 'paused', 'completed')) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS visibility TEXT CHECK (visibility IN ('public', 'private', 'organization')) DEFAULT 'organization',
ADD COLUMN IF NOT EXISTS featured_image_url TEXT,
ADD COLUMN IF NOT EXISTS campaign_page_url TEXT,
ADD COLUMN IF NOT EXISTS social_share_text TEXT,
ADD COLUMN IF NOT EXISTS analytics_enabled BOOLEAN DEFAULT TRUE;

-- Enhance donations table
ALTER TABLE donations
ADD COLUMN IF NOT EXISTS tier_id UUID REFERENCES donation_tiers(id),
ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('card', 'bank_transfer', 'cash', 'check')),
ADD COLUMN IF NOT EXISTS receipt_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS receipt_sent_at TIMESTAMP;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_fundraiser_categories_org_id ON fundraiser_categories(org_id);
CREATE INDEX IF NOT EXISTS idx_donation_tiers_fundraiser_id ON donation_tiers(fundraiser_id);
CREATE INDEX IF NOT EXISTS idx_fundraiser_analytics_fundraiser_id ON fundraiser_analytics(fundraiser_id);
CREATE INDEX IF NOT EXISTS idx_fundraiser_analytics_date ON fundraiser_analytics(date);
CREATE INDEX IF NOT EXISTS idx_fundraiser_shares_fundraiser_id ON fundraiser_shares(fundraiser_id);

-- Enable Row Level Security
ALTER TABLE fundraiser_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE fundraiser_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE fundraiser_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Fundraiser Categories
CREATE POLICY "Users can view categories in their org" ON fundraiser_categories
    FOR SELECT USING (org_id = get_user_org_id());

CREATE POLICY "Admins can manage categories" ON fundraiser_categories
    FOR ALL USING (org_id = get_user_org_id() AND user_has_role('admin'));

-- RLS Policies for Donation Tiers
CREATE POLICY "Anyone can view donation tiers" ON donation_tiers
    FOR SELECT USING (true);

CREATE POLICY "Fundraiser creators can manage tiers" ON donation_tiers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM fundraisers 
            WHERE fundraisers.id = donation_tiers.fundraiser_id 
            AND fundraisers.created_by = auth.uid()
        )
    );

-- RLS Policies for Analytics
CREATE POLICY "Fundraiser creators can view analytics" ON fundraiser_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM fundraisers 
            WHERE fundraisers.id = fundraiser_analytics.fundraiser_id 
            AND fundraisers.created_by = auth.uid()
        )
    );

-- RLS Policies for Social Shares
CREATE POLICY "Anyone can view shares" ON fundraiser_shares
    FOR SELECT USING (true);

CREATE POLICY "Users can create shares" ON fundraiser_shares
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM fundraisers 
            WHERE fundraisers.id = fundraiser_shares.fundraiser_id 
            AND fundraisers.visibility = 'public'
        )
    );

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_fundraiser_categories_updated_at 
    BEFORE UPDATE ON fundraiser_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donation_tiers_updated_at 
    BEFORE UPDATE ON donation_tiers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO fundraiser_categories (org_id, name, description)
SELECT 
    id as org_id,
    'General Fundraising' as name,
    'General fundraising campaigns for the organization' as description
FROM organizations
ON CONFLICT DO NOTHING;

INSERT INTO fundraiser_categories (org_id, name, description)
SELECT 
    id as org_id,
    'School Events' as name,
    'Fundraising for school events and activities' as description
FROM organizations
ON CONFLICT DO NOTHING;

INSERT INTO fundraiser_categories (org_id, name, description)
SELECT 
    id as org_id,
    'Teacher Support' as name,
    'Fundraising for teacher resources and classroom needs' as description
FROM organizations
ON CONFLICT DO NOTHING; 