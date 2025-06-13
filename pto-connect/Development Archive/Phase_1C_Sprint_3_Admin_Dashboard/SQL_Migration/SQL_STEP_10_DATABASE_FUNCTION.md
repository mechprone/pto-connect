# Step 10: Create Database Function - CRITICAL STEP

**This is the most important step - the function that the backend middleware depends on!**

**Execute this entire function as ONE SINGLE COMMAND in Supabase SQL Editor:**

```sql
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
```

---

**⚠️ IMPORTANT: Copy and paste this ENTIRE function as one command. Do NOT break it into smaller pieces. After executing this function successfully, let me know and I'll provide the final steps for indexes and RLS policies.**
