# Step 8: Teacher Requests Module - Individual INSERT Statements

**Execute these one at a time in Supabase SQL Editor:**

## Insert 1:
```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES ('teacher_requests', 'can_view_requests', 'View Teacher Requests', 'View teacher requests and wish lists', 'volunteer');
```

## Insert 2:
```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES ('teacher_requests', 'can_create_requests', 'Create Teacher Requests', 'Submit new teacher requests', 'volunteer');
```

## Insert 3:
```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES ('teacher_requests', 'can_fulfill_requests', 'Fulfill Teacher Requests', 'Mark teacher requests as fulfilled', 'committee_lead');
```

---

**After completing all 3 teacher requests inserts, let me know and I'll provide Step 9 (User Management Module) - the final set of permission inserts.**
