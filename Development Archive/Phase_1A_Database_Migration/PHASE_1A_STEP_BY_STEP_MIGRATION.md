# 🚀 Phase 1A: Step-by-Step Database Migration

**Execute each script separately and provide results before proceeding to the next**

## 📋 PRE-MIGRATION VERIFICATION

### **Step 1: Verify Current State**
```sql
-- Confirm current data state before migration
SELECT 
    'organizations' as table_name, 
    COUNT(*) as count 
FROM organizations
UNION ALL
SELECT 
    'ptos' as table_name, 
    COUNT(*) as count 
FROM ptos
UNION ALL
SELECT 
    'profiles_with_null_org' as table_name, 
    COUNT(*) as count 
FROM profiles 
WHERE org_id IS NULL
UNION ALL
SELECT 
    'profiles_with_null_email' as table_name, 
    COUNT(*) as count 
FROM profiles 
WHERE email IS NULL;
```

**Expected Results:**
- organizations: 0
- ptos: 1  
- profiles_with_null_org: 8
- profiles_with_null_email: 8

---

## 🔄 MIGRATION EXECUTION

### **Step 2: Migrate PTO to Organizations**
```sql
-- STEP 2: Migrate the single PTO record to organizations table
INSERT INTO organizations (id, name, signup_code, subscription_status, created_at)
SELECT 
    id, 
    name, 
    invite_code as signup_code, 
    'active' as subscription_status, 
    created_at 
FROM ptos
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE id = ptos.id);
```

**After running, verify with:**
```sql
SELECT 
    o.id,
    o.name,
    o.signup_code,
    o.subscription_status,
    p.name as original_pto_name,
    p.invite_code as original_invite_code
FROM organizations o
JOIN ptos p ON o.id = p.id;
```

---

### **Step 3: Update Profile Organization References**
```sql
-- STEP 3: Update profiles to reference the migrated organization
UPDATE profiles 
SET org_id = (SELECT id FROM organizations LIMIT 1)
WHERE org_id IS NULL;
```

**After running, verify with:**
```sql
SELECT 
    COUNT(*) as profiles_updated,
    org_id
FROM profiles 
GROUP BY org_id;
```

---

### **Step 4: Sync Profile Emails from Auth.Users**
```sql
-- STEP 4: Update profiles with emails from auth.users
UPDATE profiles 
SET email = au.email
FROM auth.users au 
WHERE profiles.id = au.id 
AND profiles.email IS NULL;
```

**After running, verify with:**
```sql
SELECT 
    p.id,
    p.email as profile_email,
    au.email as auth_email,
    CASE 
        WHEN p.email = au.email THEN 'SYNCED ✅'
        ELSE 'MISMATCH ❌'
    END as sync_status
FROM profiles p
JOIN auth.users au ON p.id = au.id
ORDER BY p.email;
```

---

### **Step 5: Update Foreign Key Constraint**
```sql
-- STEP 5A: Drop old constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_pto_id_fkey;
```

```sql
-- STEP 5B: Add new constraint
ALTER TABLE profiles 
ADD CONSTRAINT profiles_org_id_fkey 
FOREIGN KEY (org_id) REFERENCES organizations(id);
```

**After running, verify with:**
```sql
-- Check constraint exists
SELECT 
    conname as constraint_name,
    conrelid::regclass as table_name,
    confrelid::regclass as referenced_table
FROM pg_constraint 
WHERE conname = 'profiles_org_id_fkey';
```

---

## ✅ POST-MIGRATION VERIFICATION

### **Step 6: Complete Data Integrity Check**
```sql
-- STEP 6: Final verification of migration success
SELECT 
    'Migration Summary' as check_type,
    'organizations_count' as metric,
    COUNT(*)::text as value
FROM organizations
UNION ALL
SELECT 
    'Migration Summary' as check_type,
    'profiles_with_org_id' as metric,
    COUNT(*)::text as value
FROM profiles 
WHERE org_id IS NOT NULL
UNION ALL
SELECT 
    'Migration Summary' as check_type,
    'profiles_with_email' as metric,
    COUNT(*)::text as value
FROM profiles 
WHERE email IS NOT NULL
UNION ALL
SELECT 
    'Migration Summary' as check_type,
    'foreign_key_valid' as metric,
    CASE 
        WHEN COUNT(*) = 0 THEN 'VALID ✅'
        ELSE 'INVALID ❌'
    END as value
FROM profiles p
LEFT JOIN organizations o ON p.org_id = o.id
WHERE p.org_id IS NOT NULL AND o.id IS NULL;
```

**Expected Final Results:**
- organizations_count: 1
- profiles_with_org_id: 8  
- profiles_with_email: 8
- foreign_key_valid: VALID ✅

---

## 🔄 ROLLBACK PROCEDURE (If Needed)

### **Emergency Rollback Script**
```sql
-- EMERGENCY ROLLBACK - Only run if migration fails
BEGIN;

-- Restore original foreign key
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_org_id_fkey;
ALTER TABLE profiles ADD CONSTRAINT profiles_pto_id_fkey 
FOREIGN KEY (org_id) REFERENCES ptos(id);

-- Clear organization references
UPDATE profiles SET org_id = NULL WHERE org_id IS NOT NULL;

-- Remove migrated organization
DELETE FROM organizations;

-- Clear profile emails
UPDATE profiles SET email = NULL;

COMMIT;
```

---

## 📊 EXECUTION CHECKLIST

- [ ] **Step 1**: Pre-migration verification completed
- [ ] **Step 2**: PTO migrated to organizations table
- [ ] **Step 3**: Profile org_id references updated  
- [ ] **Step 4**: Profile emails synced from auth.users
- [ ] **Step 5A**: Old foreign key constraint dropped
- [ ] **Step 5B**: New foreign key constraint added
- [ ] **Step 6**: Post-migration verification passed
- [ ] **Ready for Phase 1B**: RLS Policy Standardization

**Ready to begin Step 1? Run the pre-migration verification query and provide the results.**
