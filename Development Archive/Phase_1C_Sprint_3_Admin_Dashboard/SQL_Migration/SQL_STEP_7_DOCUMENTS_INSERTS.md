# Step 7: Documents Module - Individual INSERT Statements

**Execute these one at a time in Supabase SQL Editor:**

## Insert 1:
```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES ('documents', 'can_view_documents', 'View Documents', 'Access and download organization documents', 'volunteer');
```

## Insert 2:
```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES ('documents', 'can_upload_documents', 'Upload Documents', 'Upload new documents to the organization', 'committee_lead');
```

## Insert 3:
```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES ('documents', 'can_delete_documents', 'Delete Documents', 'Remove documents from the organization', 'board_member');
```

---

**After completing all 3 documents inserts, let me know and I'll provide Step 8 (Teacher Requests Module) individual inserts.**
