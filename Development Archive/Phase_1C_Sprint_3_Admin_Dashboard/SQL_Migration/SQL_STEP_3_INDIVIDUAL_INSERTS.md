# Step 3: Communications Module - Individual INSERT Statements

**Execute these one at a time in Supabase SQL Editor to avoid syntax errors:**

## Insert 1:
```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES ('communications', 'can_view_messages', 'View Messages', 'View organization messages and communications', 'volunteer');
```

## Insert 2:
```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES ('communications', 'can_create_messages', 'Create Messages', 'Create and send messages to organization members', 'committee_lead');
```

## Insert 3:
```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES ('communications', 'can_edit_messages', 'Edit Messages', 'Edit existing messages and communications', 'committee_lead');
```

## Insert 4:
```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES ('communications', 'can_delete_messages', 'Delete Messages', 'Delete messages and communications', 'board_member');
```

## Insert 5:
```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES ('communications', 'can_create_email_drafts', 'Create Email Drafts', 'Create and edit email drafts', 'committee_lead');
```

## Insert 6:
```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES ('communications', 'can_send_emails', 'Send Emails', 'Send emails to organization members', 'board_member');
```

---

**After completing all 6 communications inserts, let me know and I'll provide Step 4 (Budget Module) individual inserts.**
