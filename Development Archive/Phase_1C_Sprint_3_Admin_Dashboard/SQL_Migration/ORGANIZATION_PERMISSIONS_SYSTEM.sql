-- Organization-Specific Permission System
-- Allows each PTO admin to customize which roles can perform which actions

-- 1. Organization Permission Templates Table
-- Defines available permissions for each module
CREATE TABLE IF NOT EXISTS organization_permission_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name VARCHAR(50) NOT NULL, -- 'communications', 'budget', 'events', 'fundraising', etc.
  permission_key VARCHAR(100) NOT NULL, -- 'can_create_emails', 'can_approve_budget', etc.
  permission_name VARCHAR(200) NOT NULL, -- 'Create Email Drafts', 'Approve Budget Items'
  permission_description TEXT,
  default_min_role VARCHAR(20) DEFAULT 'committee_lead', -- Default minimum role required
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Organization Custom Permissions Table
-- Stores each organization's custom permission settings
CREATE TABLE IF NOT EXISTS organization_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  permission_key VARCHAR(100) NOT NULL, -- References permission_templates.permission_key
  min_role_required VARCHAR(20) NOT NULL, -- 'volunteer', 'committee_lead', 'board_member', 'admin'
  specific_users UUID[], -- Optional: specific user IDs who have this permission regardless of role
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(org_id, permission_key)
);

-- 3. Insert Default Permission Templates
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES
-- Communications Module
('communications', 'can_view_messages', 'View Messages', 'View organization messages and communications', 'volunteer'),
('communications', 'can_create_messages', 'Create Messages', 'Create and send messages to organization members', 'committee_lead'),
('communications', 'can_edit_messages', 'Edit Messages', 'Edit existing messages and communications', 'committee_lead'),
('communications', 'can_delete_messages', 'Delete Messages', 'Delete messages and communications', 'board_member'),
('communications', 'can_create_email_drafts', 'Create Email Drafts', 'Create and edit email drafts', 'committee_lead'),
('communications', 'can_send_emails', 'Send Emails', 'Send emails to organization members', 'board_member'),

-- Budget Module
('budget', 'can_view_budget', 'View Budget', 'View budget items and financial information', 'volunteer'),
('budget', 'can_create_budget_items', 'Create Budget Items', 'Add new budget items and expenses', 'committee_lead'),
('budget', 'can_edit_budget_items', 'Edit Budget Items', 'Modify existing budget items', 'committee_lead'),
('budget', 'can_delete_budget_items', 'Delete Budget Items', 'Remove budget items', 'board_member'),
('budget', 'can_approve_expenses', 'Approve Expenses', 'Approve expense requests and reimbursements', 'board_member'),

-- Events Module
('events', 'can_view_events', 'View Events', 'View organization events and activities', 'volunteer'),
('events', 'can_create_events', 'Create Events', 'Create new events and activities', 'committee_lead'),
('events', 'can_edit_events', 'Edit Events', 'Modify existing events', 'committee_lead'),
('events', 'can_delete_events', 'Delete Events', 'Remove events from the calendar', 'board_member'),
('events', 'can_manage_volunteers', 'Manage Event Volunteers', 'Assign and manage event volunteers', 'committee_lead'),

-- Fundraising Module
('fundraising', 'can_view_fundraisers', 'View Fundraisers', 'View fundraising campaigns and progress', 'volunteer'),
('fundraising', 'can_create_fundraisers', 'Create Fundraisers', 'Create new fundraising campaigns', 'committee_lead'),
('fundraising', 'can_edit_fundraisers', 'Edit Fundraisers', 'Modify existing fundraising campaigns', 'committee_lead'),
('fundraising', 'can_delete_fundraisers', 'Delete Fundraisers', 'Remove fundraising campaigns', 'board_member'),

-- Documents Module
('documents', 'can_view_documents', 'View Documents', 'Access and download organization documents', 'volunteer'),
('documents', 'can_upload_documents', 'Upload Documents', 'Upload new documents to the organization', 'committee_lead'),
('documents', 'can_delete_documents', 'Delete Documents', 'Remove documents from the organization', 'board_member'),

-- Teacher Requests Module
('teacher_requests', 'can_view_requests', 'View Teacher Requests', 'View teacher requests and wish lists', 'volunteer'),
('teacher_requests', 'can_create_requests', 'Create Teacher Requests', 'Submit new teacher requests', 'volunteer'),
('teacher_requests', 'can_fulfill_requests', 'Fulfill Teacher Requests', 'Mark teacher requests as fulfilled', 'committee_lead'),

-- User Management Module
('user_management', 'can_view_users', 'View Users', 'View organization member list', 'committee_lead'),
('user_management', 'can_edit_user_roles', 'Edit User Roles', 'Change user roles and permissions', 'admin'),
('user_management', 'can_invite_users', 'Invite Users', 'Send invitations to new members', 'board_member'),
('user_management', 'can_remove_users', 'Remove Users', 'Remove users from the organization', 'admin');

-- 4. Create function to check organization-specific permissions
CREATE OR REPLACE FUNCTION user_has_org_permission(
  user_id_param UUID,
  permission_key_param VARCHAR(100)
) RETURNS BOOLEAN AS $$
DECLARE
  user_org_id UUID;
  user_role VARCHAR(20);
  required_role VARCHAR(20);
  specific_users UUID[];
  permission_enabled BOOLEAN;
  role_hierarchy INTEGER;
  required_hierarchy INTEGER;
BEGIN
  -- Get user's organization and role
  SELECT org_id, role INTO user_org_id, user_role
  FROM profiles 
  WHERE user_id = user_id_param;
  
  IF user_org_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if organization has custom permission settings
  SELECT min_role_required, specific_users, is_enabled 
  INTO required_role, specific_users, permission_enabled
  FROM organization_permissions 
  WHERE org_id = user_org_id AND permission_key = permission_key_param;
  
  -- If no custom permission found, use default from template
  IF required_role IS NULL THEN
    SELECT default_min_role INTO required_role
    FROM organization_permission_templates 
    WHERE permission_key = permission_key_param;
    
    -- Default to enabled if no custom setting
    permission_enabled := TRUE;
  END IF;
  
  -- If permission is disabled, deny access
  IF NOT permission_enabled THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user is in specific_users list (overrides role requirement)
  IF specific_users IS NOT NULL AND user_id_param = ANY(specific_users) THEN
    RETURN TRUE;
  END IF;
  
  -- Check role hierarchy
  role_hierarchy := CASE user_role
    WHEN 'admin' THEN 4
    WHEN 'board_member' THEN 3
    WHEN 'committee_lead' THEN 2
    WHEN 'volunteer' THEN 1
    ELSE 0
  END;
  
  required_hierarchy := CASE required_role
    WHEN 'admin' THEN 4
    WHEN 'board_member' THEN 3
    WHEN 'committee_lead' THEN 2
    WHEN 'volunteer' THEN 1
    ELSE 0
  END;
  
  RETURN role_hierarchy >= required_hierarchy;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_org_permissions_org_id ON organization_permissions(org_id);
CREATE INDEX IF NOT EXISTS idx_org_permissions_key ON organization_permissions(permission_key);
CREATE INDEX IF NOT EXISTS idx_permission_templates_module ON organization_permission_templates(module_name);

-- 6. Add RLS policies
ALTER TABLE organization_permission_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_permissions ENABLE ROW LEVEL SECURITY;

-- Templates are readable by all authenticated users
CREATE POLICY "Templates readable by authenticated users" ON organization_permission_templates
  FOR SELECT TO authenticated USING (true);

-- Organization permissions are only accessible by users in that organization
CREATE POLICY "Organization permissions accessible by org members" ON organization_permissions
  FOR ALL TO authenticated USING (org_id = get_user_org_id());

-- Only admins can modify organization permissions
CREATE POLICY "Only admins can modify org permissions" ON organization_permissions
  FOR INSERT TO authenticated WITH CHECK (user_has_min_role('admin'));

CREATE POLICY "Only admins can update org permissions" ON organization_permissions
  FOR UPDATE TO authenticated USING (user_has_min_role('admin'));

CREATE POLICY "Only admins can delete org permissions" ON organization_permissions
  FOR DELETE TO authenticated USING (user_has_min_role('admin'));
