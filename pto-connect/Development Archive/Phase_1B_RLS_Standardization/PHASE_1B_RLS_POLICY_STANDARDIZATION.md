# 🔒 Phase 1B: RLS Policy Standardization

**Execute each script separately and provide results before proceeding to the next**

## 🎯 PHASE 1A MIGRATION COMPLETE ✅

### **Migration Results Summary:**
- ✅ **organizations_count**: 1 (Sunset Elementary PTO migrated)
- ✅ **profiles_with_org_id**: 8 (All users linked to organization)
- ✅ **profiles_with_email**: 8 (All emails synced from auth.users)
- ✅ **foreign_key_valid**: VALID ✅ (Proper referential integrity)

---

## 📋 PHASE 1B: RLS POLICY CLEANUP

### **Objective**: Standardize all RLS policies to use consistent organizational context

## 🔍 PRE-CLEANUP ANALYSIS

### **Step 1: Identify Duplicate/Conflicting Policies**
```sql
-- Check for duplicate organization policies
SELECT 
    tablename,
    policyname,
    cmd as command_type,
    qual as policy_condition
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename = 'organizations'
ORDER BY tablename, cmd, policyname;
```

### **Step 2: Check Events Table Policies**
```sql
-- Check for duplicate events policies
SELECT 
    tablename,
    policyname,
    cmd as command_type,
    qual as policy_condition
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename = 'events'
ORDER BY tablename, cmd, policyname;
```

---

## 🧹 POLICY CLEANUP EXECUTION

### **Step 3: Clean Organizations Table Policies**
```sql
-- STEP 3A: Remove conflicting organization policies
DROP POLICY IF EXISTS "Allow select for org owner" ON organizations;
```

```sql
-- STEP 3B: Remove duplicate organization policies
DROP POLICY IF EXISTS "Allow update for org owner" ON organizations;
```

**Verify removal:**
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'organizations' 
    AND schemaname = 'public'
ORDER BY cmd, policyname;
```

### **Step 4: Clean Events Table Policies**
```sql
-- STEP 4A: Remove duplicate events policies
DROP POLICY IF EXISTS "Allow select for same org" ON events;
```

```sql
-- STEP 4B: Remove duplicate events policies
DROP POLICY IF EXISTS "Allow update for same org" ON events;
```

```sql
-- STEP 4C: Remove duplicate events policies
DROP POLICY IF EXISTS "Allow delete for same org" ON events;
```

**Verify removal:**
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'events' 
    AND schemaname = 'public'
ORDER BY cmd, policyname;
```

---

## 🔧 STANDARDIZED POLICY IMPLEMENTATION

### **Step 5: Implement Standardized Organization Policies**
```sql
-- STEP 5A: Create standardized organization SELECT policy
CREATE POLICY "Users can view their organization" ON organizations
FOR SELECT USING (id = get_user_org_id());
```

```sql
-- STEP 5B: Create standardized organization UPDATE policy
CREATE POLICY "Admins can update their organization" ON organizations
FOR UPDATE USING (id = get_user_org_id() AND user_has_min_role('admin'));
```

**Verify new policies:**
```sql
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'organizations' 
    AND schemaname = 'public'
ORDER BY cmd, policyname;
```

### **Step 6: Implement Standardized Events Policies**
```sql
-- STEP 6A: Create standardized events SELECT policy
CREATE POLICY "Users can view org events" ON events
FOR SELECT USING (org_id = get_user_org_id());
```

```sql
-- STEP 6B: Create standardized events management policy
CREATE POLICY "Users can manage org events" ON events
FOR ALL USING (org_id = get_user_org_id());
```

**Verify new policies:**
```sql
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'events' 
    AND schemaname = 'public'
ORDER BY cmd, policyname;
```

---

## 🔍 ADDITIONAL POLICY STANDARDIZATION

### **Step 7: Check Profile Policies for Consistency**
```sql
-- Check profile policies for duplicates
SELECT 
    policyname,
    cmd as command_type,
    qual as policy_condition
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename = 'profiles'
ORDER BY cmd, policyname;
```

### **Step 8: Clean Profile Duplicate Policies (if needed)**
```sql
-- Remove duplicate profile policies (run only if duplicates found)
DROP POLICY IF EXISTS "User can read own profile" ON profiles;
```

```sql
-- Remove duplicate profile policies (run only if duplicates found)
DROP POLICY IF EXISTS "User can update own profile" ON profiles;
```

**Verify profile policies:**
```sql
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles' 
    AND schemaname = 'public'
ORDER BY cmd, policyname;
```

---

## ✅ FINAL VERIFICATION

### **Step 9: Complete RLS Policy Audit**
```sql
-- Final audit of all RLS policies
SELECT 
    tablename,
    COUNT(*) as policy_count,
    STRING_AGG(DISTINCT cmd, ', ') as commands_covered
FROM pg_policies 
WHERE schemaname = 'public'
    AND tablename IN ('organizations', 'profiles', 'events', 'email_drafts', 'notifications')
GROUP BY tablename
ORDER BY tablename;
```

### **Step 10: Test Organizational Context Function**
```sql
-- Test get_user_org_id() function works correctly
SELECT 
    'get_user_org_id_test' as test_name,
    CASE 
        WHEN get_user_org_id() IS NOT NULL THEN 'FUNCTION_WORKING ✅'
        ELSE 'FUNCTION_ISSUE ❌'
    END as status;
```

---

## 🎯 SUCCESS CRITERIA

### **Expected Results After Phase 1B:**
- [ ] **Organizations table**: 2 policies (SELECT, UPDATE)
- [ ] **Events table**: 2 policies (SELECT, ALL)  
- [ ] **Profiles table**: Clean, non-duplicate policies
- [ ] **All policies**: Use `get_user_org_id()` for consistency
- [ ] **Function test**: `get_user_org_id()` working correctly

---

## 🔄 ROLLBACK PROCEDURE (If Needed)

### **Emergency Rollback Script**
```sql
-- EMERGENCY ROLLBACK - Restore original policies
BEGIN;

-- Restore original organization policies
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
DROP POLICY IF EXISTS "Admins can update their organization" ON organizations;

CREATE POLICY "Allow select for org owner" ON organizations
FOR SELECT USING (id = (current_setting('request.org_id'::text, true))::uuid);

CREATE POLICY "Allow update for org owner" ON organizations
FOR UPDATE USING (id = (current_setting('request.org_id'::text, true))::uuid);

-- Restore original events policies
DROP POLICY IF EXISTS "Users can view org events" ON events;
DROP POLICY IF EXISTS "Users can manage org events" ON events;

CREATE POLICY "Allow select for same org" ON events
FOR SELECT USING ((auth.uid() IS NOT NULL) AND (org_id = ( SELECT events.org_id FROM profiles WHERE (profiles.id = auth.uid()))));

COMMIT;
```

---

## 📊 EXECUTION CHECKLIST

- [ ] **Step 1**: Pre-cleanup analysis completed
- [ ] **Step 2**: Events policies analyzed
- [ ] **Step 3**: Organization duplicate policies removed
- [ ] **Step 4**: Events duplicate policies removed
- [ ] **Step 5**: Standardized organization policies created
- [ ] **Step 6**: Standardized events policies created
- [ ] **Step 7**: Profile policies checked
- [ ] **Step 8**: Profile duplicates cleaned (if needed)
- [ ] **Step 9**: Final RLS audit completed
- [ ] **Step 10**: Function test passed
- [ ] **Ready for Phase 1C**: Authentication System Enhancement

**Ready to begin Step 1? Run the organization policies analysis query and provide the results.**
