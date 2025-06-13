# Step 4: Budget Module - Individual INSERT Statements

**Execute these one at a time in Supabase SQL Editor:**

## Insert 1:
```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES ('budget', 'can_view_budget', 'View Budget', 'View budget items and financial information', 'volunteer');
```

## Insert 2:
```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES ('budget', 'can_create_budget_items', 'Create Budget Items', 'Add new budget items and expenses', 'committee_lead');
```

## Insert 3:
```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES ('budget', 'can_edit_budget_items', 'Edit Budget Items', 'Modify existing budget items', 'committee_lead');
```

## Insert 4:
```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES ('budget', 'can_delete_budget_items', 'Delete Budget Items', 'Remove budget items', 'board_member');
```

## Insert 5:
```sql
INSERT INTO organization_permission_templates (module_name, permission_key, permission_name, permission_description, default_min_role) VALUES ('budget', 'can_approve_expenses', 'Approve Expenses', 'Approve expense requests and reimbursements', 'board_member');
```

---

**After completing all 5 budget inserts, let me know and I'll provide Step 5 (Events Module) individual inserts.**
