# Step 9: User Management Module - Final INSERT Statements

**Execute these one at a time in Supabase SQL Editor:**

## Insert 1:
```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES ('user_management', 'can_view_users', 'View Users', 'View organization member list', 'committee_lead');
```

## Insert 2:
```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES ('user_management', 'can_edit_user_roles', 'Edit User Roles', 'Change user roles and permissions', 'admin');
```

## Insert 3:
```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES ('user_management', 'can_invite_users', 'Invite Users', 'Send invitations to new members', 'board_member');
```

## Insert 4:
```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES ('user_management', 'can_remove_users', 'Remove Users', 'Remove users from the organization', 'admin');
```

---

**🎉 After completing all 4 user management inserts, you'll have finished inserting all 28 permission templates! Let me know when done and I'll provide the next steps for creating the database function and indexes.**
