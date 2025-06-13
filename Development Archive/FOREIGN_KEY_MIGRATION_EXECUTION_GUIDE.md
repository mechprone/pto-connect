# 🔧 Foreign Key Architecture Migration - Execution Guide

**Date**: June 12, 2025  
**Purpose**: Safe execution of foreign key architecture fixes  
**Status**: Ready for execution

---

## 🎯 MIGRATION OVERVIEW

**Goal**: Update all foreign key constraints from `users.id` to `profiles.id`  
**Impact**: 7 tables with foreign key relationships  
**Risk Level**: Medium (reversible with backup)  
**Estimated Time**: 5-10 minutes

---

## ✅ PRE-MIGRATION CHECKLIST

### 1. **Database Backup** ⚠️ CRITICAL
**For Free Plan Users (Manual Backup Required):**

Since Supabase free plan doesn't include automated backups, run the queries in `FREE_PLAN_BACKUP_STRATEGY.sql`:

1. Open Supabase SQL Editor
2. Run each backup query from the file
3. Save the results to text files on your computer
4. This creates INSERT statements to restore your data if needed

**Key Backup Queries:**
```sql
-- Backup profiles (most critical)
SELECT 'INSERT INTO profiles...' FROM profiles;

-- Backup organizations  
SELECT 'INSERT INTO organizations...' FROM organizations;

-- Backup current foreign key constraints
SELECT 'ALTER TABLE...' FROM information_schema.table_constraints...
```

### 2. **Verify Current State**
```sql
-- Confirm users table is empty
SELECT COUNT(*) FROM users;

-- Check current foreign key constraints
SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'users';
```

### 3. **Application Status**
- ✅ App is live but not public (perfect for testing)
- ✅ Minimal data in database
- ✅ Application code already uses `profiles` table

---

## 🚀 EXECUTION STEPS

### Step 1: Execute Migration Script
1. Open Supabase SQL Editor
2. Copy the entire `FOREIGN_KEY_ARCHITECTURE_FIX_MIGRATION.sql` script
3. Execute the script (it's wrapped in BEGIN/COMMIT for safety)

### Step 2: Verify Migration Success
Run the verification queries included in the script:

```sql
-- Should show 7 new constraints referencing profiles
SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'profiles';

-- Should return 0 results (no more users constraints)
SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'users';
```

### Step 3: Test Application Functionality
1. **Authentication**: Login/logout functionality
2. **Reconciliation**: Test the budget reconciliation module
3. **Events**: Create/edit events (tests event_lead constraint)
4. **Transactions**: Create financial transactions (tests created_by constraint)
5. **Documents**: Upload documents (tests uploaded_by constraint)

---

## 🔍 EXPECTED RESULTS

### ✅ Success Indicators:
- Migration script executes without errors
- 7 new foreign key constraints created referencing `profiles`
- 0 foreign key constraints remaining that reference `users`
- Application functions normally
- No database integrity errors

### ❌ Failure Indicators:
- Script execution errors
- Foreign key constraint violations
- Application errors when creating records
- Authentication issues

---

## 🚨 ROLLBACK PLAN

If issues occur, you have two options:

### Option 1: Database Restore (Recommended)
1. Restore from the backup created before migration
2. Investigate issues before re-attempting

### Option 2: Manual Rollback
```sql
BEGIN;

-- Drop new constraints
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_event_lead_fkey;
ALTER TABLE rsvps DROP CONSTRAINT IF EXISTS rsvps_user_id_fkey;
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_uploaded_by_fkey;
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_created_by_fkey;
ALTER TABLE fundraisers DROP CONSTRAINT IF EXISTS fundraisers_created_by_fkey;
ALTER TABLE teacher_requests DROP CONSTRAINT IF EXISTS teacher_requests_teacher_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_created_by_fkey;

-- Recreate original constraints (referencing users)
ALTER TABLE events ADD CONSTRAINT events_event_lead_fkey FOREIGN KEY (event_lead) REFERENCES users(id);
ALTER TABLE rsvps ADD CONSTRAINT rsvps_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE documents ADD CONSTRAINT documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES users(id);
ALTER TABLE transactions ADD CONSTRAINT transactions_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE fundraisers ADD CONSTRAINT fundraisers_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE teacher_requests ADD CONSTRAINT teacher_requests_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES users(id);
ALTER TABLE messages ADD CONSTRAINT messages_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id);

COMMIT;
```

---

## 📋 POST-MIGRATION TASKS

### Immediate (After Migration):
1. ✅ Verify migration success with queries
2. ✅ Test core application functionality
3. ✅ Monitor for any errors in application logs

### Short-term (Next 24-48 hours):
1. Monitor application performance
2. Test all user-related functionality thoroughly
3. Check for any edge cases or missed references

### Long-term (After Stability Confirmed):
1. Consider removing `users` table (if no longer needed)
2. Update documentation to reflect new architecture
3. Add this migration to deployment scripts for other environments

---

## 🎯 BENEFITS AFTER MIGRATION

### ✅ Improved Architecture:
- **Consistent References**: All foreign keys point to active `profiles` table
- **Data Integrity**: Proper relationships between user data and other entities
- **Simplified Queries**: No confusion between `users` and `profiles`
- **Future-Proof**: Clean foundation for continued development

### ✅ Resolved Issues:
- **Reconciliation Module**: Already working with `profiles` table
- **Dashboard Analytics**: Already using `profiles` table
- **Foreign Key Integrity**: Proper relationships established
- **Database Consistency**: Clean, logical data model

---

**Status**: Ready for execution  
**Risk Level**: Medium (with backup safety net)  
**Recommended Timing**: During low-usage period  
**Estimated Duration**: 5-10 minutes
