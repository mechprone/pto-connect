# 🗄️ SQL Migration - Step by Step Execution

**Execute these SQL commands one at a time in Supabase SQL Editor**

## Step 1: Create Organization Permission Templates Table

```sql
CREATE TABLE IF NOT EXISTS organization_permission_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name VARCHAR(50) NOT NULL,
  permission_key VARCHAR(100) NOT NULL,
  permission_name VARCHAR(200) NOT NULL,
  permission_description TEXT,
  default_min_role VARCHAR(20) DEFAULT 'committee_lead',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Step 2: Create Organization Permissions Table

```sql
CREATE TABLE IF NOT EXISTS organization_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  permission_key VARCHAR(100) NOT NULL,
  min_role_required VARCHAR(20) NOT NULL,
  specific_users UUID[],
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(org_id, permission_key)
);
```

## Step 3: Insert Communications Module Permissions

```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES
('communications', 'can_view_messages', 'View Messages', 'View organization messages and communications', 'volunteer'),
('communications', 'can_create_messages', 'Create Messages', 'Create and send messages to organization members', 'committee_lead'),
('communications', 'can_edit_messages', 'Edit Messages', 'Edit existing messages and communications', 'committee_lead'),
('communications', 'can_delete_messages', 'Delete Messages', 'Delete messages and communications', 'board_member'),
('communications', 'can_create_email_drafts', 'Create Email Drafts', 'Create and edit email drafts', 'committee_lead'),
('communications', 'can_send_emails', 'Send Emails', 'Send emails to organization members', 'board_member');
```

## Step 4: Insert Budget Module Permissions

```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES
('budget', 'can_view_budget', 'View Budget', 'View budget items and financial information', 'volunteer'),
('budget', 'can_create_budget_items', 'Create Budget Items', 'Add new budget items and expenses', 'committee_lead'),
('budget', 'can_edit_budget_items', 'Edit Budget Items', 'Modify existing budget items', 'committee_lead'),
('budget', 'can_delete_budget_items', 'Delete Budget Items', 'Remove budget items', 'board_member'),
('budget', 'can_approve_expenses', 'Approve Expenses', 'Approve expense requests and reimbursements', 'board_member');
```

## Step 5: Insert Events Module Permissions

```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES
('events', 'can_view_events', 'View Events', 'View organization events and activities', 'volunteer'),
('events', 'can_create_events', 'Create Events', 'Create new events and activities', 'committee_lead'),
('events', 'can_edit_events', 'Edit Events', 'Modify existing events', 'committee_lead'),
('events', 'can_delete_events', 'Delete Events', 'Remove events from the calendar', 'board_member'),
('events', 'can_manage_volunteers', 'Manage Event Volunteers', 'Assign and manage event volunteers', 'committee_lead');
```

## Step 6: Insert Fundraising Module Permissions

```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES
('fundraising', 'can_view_fundraisers', 'View Fundraisers', 'View fundraising campaigns and progress', 'volunteer'),
('fundraising', 'can_create_fundraisers', 'Create Fundraisers', 'Create new fundraising campaigns', 'committee_lead'),
('fundraising', 'can_edit_fundraisers', 'Edit Fundraisers', 'Modify existing fundraising campaigns', 'committee_lead'),
('fundraising', 'can_delete_fundraisers', 'Delete Fundraisers', 'Remove fundraising campaigns', 'board_member');
```

## Step 7: Insert Documents Module Permissions

```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES
('documents', 'can_view_documents', 'View Documents', 'Access and download organization documents', 'volunteer'),
('documents', 'can_upload_documents', 'Upload Documents', 'Upload new documents to the organization', 'committee_lead'),
('documents', 'can_delete_documents', 'Delete Documents', 'Remove documents from the organization', 'board_member');
```

## Step 8: Insert Teacher Requests Module Permissions

```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES
('teacher_requests', 'can_view_requests', 'View Teacher Requests', 'View teacher requests and wish lists', 'volunteer'),
('teacher_requests', 'can_create_requests', 'Create Teacher Requests', 'Submit new teacher requests', 'volunteer'),
('teacher_requests', 'can_fulfill_requests', 'Fulfill Teacher Requests', 'Mark teacher requests as fulfilled', 'committee_lead');
```

## Step 9: Insert User Management Module Permissions

```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES
('user_management', 'can_view_users', 'View Users', 'View organization member list', 'committee_lead'),
('user_management', 'can_edit_user_roles', 'Edit User Roles', 'Change user roles and permissions', 'admin'),
('user_management', 'can_invite_users', 'Invite Users', 'Send invitations to new members', 'board_member'),
('user_management', 'can_remove_users', 'Remove Users', 'Remove users from the organization', 'admin');
```

---

**After completing Step 9, let me know and I'll provide the next steps for creating the database function and indexes.**
