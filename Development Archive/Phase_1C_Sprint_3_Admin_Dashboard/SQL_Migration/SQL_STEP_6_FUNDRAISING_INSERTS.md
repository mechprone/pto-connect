# Step 6: Fundraising Module - Individual INSERT Statements

**Execute these one at a time in Supabase SQL Editor:**

## Insert 1:
```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES ('fundraising', 'can_view_fundraisers', 'View Fundraisers', 'View fundraising campaigns and progress', 'volunteer');
```

## Insert 2:
```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES ('fundraising', 'can_create_fundraisers', 'Create Fundraisers', 'Create new fundraising campaigns', 'committee_lead');
```

## Insert 3:
```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES ('fundraising', 'can_edit_fundraisers', 'Edit Fundraisers', 'Modify existing fundraising campaigns', 'committee_lead');
```

## Insert 4:
```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES ('fundraising', 'can_delete_fundraisers', 'Delete Fundraisers', 'Remove fundraising campaigns', 'board_member');
```

---

**After completing all 4 fundraising inserts, let me know and I'll provide Step 7 (Documents Module) individual inserts.**
