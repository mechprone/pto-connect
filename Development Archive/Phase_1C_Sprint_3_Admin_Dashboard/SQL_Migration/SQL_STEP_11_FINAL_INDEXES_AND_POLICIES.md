# Step 11: Final Indexes and RLS Policies

**Execute these final commands one at a time to complete the migration:**

## Create Performance Indexes:

### Index 1:
```sql
CREATE INDEX IF NOT EXISTS idx_organization_permissions_org_permission ON organization_permissions(org_id, permission_key);
```

### Index 2:
```sql
CREATE INDEX IF NOT EXISTS idx_organization_permission_templates_key ON organization_permission_templates(permission_key);
```

## Create RLS Policies:

### Policy 1:
```sql
ALTER TABLE organization_permission_templates ENABLE ROW LEVEL SECURITY;
```

### Policy 2:
```sql
CREATE POLICY "Templates are viewable by all authenticated users" ON organization_permission_templates FOR SELECT TO authenticated USING (true);
```

### Policy 3:
```sql
ALTER TABLE organization_permissions ENABLE ROW LEVEL SECURITY;
```

### Policy 4:
```sql
CREATE POLICY "Organization permissions are viewable by organization members" ON organization_permissions FOR SELECT TO authenticated USING (org_id = get_user_org_id());
```

### Policy 5:
```sql
CREATE POLICY "Organization permissions are manageable by admins" ON organization_permissions FOR ALL TO authenticated USING (org_id = get_user_org_id() AND user_has_min_role('admin'));
```

---

**🎉 After executing all these commands, the database migration will be COMPLETE! Let me know when finished and I'll guide you through re-enabling the backend routes.**
