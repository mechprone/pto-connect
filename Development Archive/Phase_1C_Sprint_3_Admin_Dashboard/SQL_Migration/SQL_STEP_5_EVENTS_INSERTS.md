# Step 5: Events Module - Individual INSERT Statements

**Execute these one at a time in Supabase SQL Editor:**

## Insert 1:
```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES ('events', 'can_view_events', 'View Events', 'View organization events and activities', 'volunteer');
```

## Insert 2:
```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES ('events', 'can_create_events', 'Create Events', 'Create new events and activities', 'committee_lead');
```

## Insert 3:
```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES ('events', 'can_edit_events', 'Edit Events', 'Modify existing events', 'committee_lead');
```

## Insert 4:
```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES ('events', 'can_delete_events', 'Delete Events', 'Remove events from the calendar', 'board_member');
```

## Insert 5:
```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES ('events', 'can_manage_volunteers', 'Manage Event Volunteers', 'Assign and manage event volunteers', 'committee_lead');
```

---

**After completing all 5 events inserts, let me know and I'll provide Step 6 (Fundraising Module) individual inserts.**
