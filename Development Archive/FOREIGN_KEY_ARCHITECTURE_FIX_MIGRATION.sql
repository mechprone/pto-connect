-- Foreign Key Architecture Fix Migration
-- Purpose: Update all foreign keys from users.id to profiles.id
-- Date: June 12, 2025
-- Status: Ready for execution

-- IMPORTANT: Run this during maintenance window
-- BACKUP DATABASE BEFORE EXECUTING

BEGIN;

-- =====================================================
-- PHASE 1: DROP EXISTING FOREIGN KEY CONSTRAINTS
-- =====================================================

-- 1. Events table - event_lead constraint
ALTER TABLE events 
DROP CONSTRAINT IF EXISTS events_event_lead_fkey;

-- 2. RSVPs table - user_id constraint  
ALTER TABLE rsvps 
DROP CONSTRAINT IF EXISTS rsvps_user_id_fkey;

-- 3. Documents table - uploaded_by constraint
ALTER TABLE documents 
DROP CONSTRAINT IF EXISTS documents_uploaded_by_fkey;

-- 4. Transactions table - created_by constraint
ALTER TABLE transactions 
DROP CONSTRAINT IF EXISTS transactions_created_by_fkey;

-- 5. Expenses table - submitted_by constraint (was expense_submissions)
ALTER TABLE expenses 
DROP CONSTRAINT IF EXISTS expenses_submitted_by_fkey;

-- 6. Fundraisers table - created_by constraint
ALTER TABLE fundraisers 
DROP CONSTRAINT IF EXISTS fundraisers_created_by_fkey;

-- 7. Teacher requests table - teacher_id constraint
ALTER TABLE teacher_requests 
DROP CONSTRAINT IF EXISTS teacher_requests_teacher_id_fkey;

-- 8. Messages table - created_by constraint
ALTER TABLE messages 
DROP CONSTRAINT IF EXISTS messages_created_by_fkey;

-- =====================================================
-- PHASE 2: UPDATE DATA REFERENCES (IF ANY EXIST)
-- =====================================================

-- Check if any tables have data that references users.id
-- Since users table is empty (0 records), these should all be NULL or non-existent

-- Update any existing references to NULL (safer approach)
-- We'll handle proper user assignment through the application

UPDATE events SET event_lead = NULL WHERE event_lead IS NOT NULL;
UPDATE rsvps SET user_id = NULL WHERE user_id IS NOT NULL;
UPDATE documents SET uploaded_by = NULL WHERE uploaded_by IS NOT NULL;
UPDATE transactions SET created_by = NULL WHERE created_by IS NOT NULL;
UPDATE fundraisers SET created_by = NULL WHERE created_by IS NOT NULL;
UPDATE teacher_requests SET teacher_id = NULL WHERE teacher_id IS NOT NULL;
UPDATE messages SET created_by = NULL WHERE created_by IS NOT NULL;

-- =====================================================
-- PHASE 3: ADD NEW FOREIGN KEY CONSTRAINTS TO PROFILES
-- =====================================================

-- 1. Events table - event_lead references profiles.id
ALTER TABLE events 
ADD CONSTRAINT events_event_lead_fkey 
FOREIGN KEY (event_lead) REFERENCES profiles(id) ON DELETE SET NULL;

-- 2. RSVPs table - user_id references profiles.id
ALTER TABLE rsvps 
ADD CONSTRAINT rsvps_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 3. Documents table - uploaded_by references profiles.id
ALTER TABLE documents 
ADD CONSTRAINT documents_uploaded_by_fkey 
FOREIGN KEY (uploaded_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- 4. Transactions table - created_by references profiles.id
ALTER TABLE transactions 
ADD CONSTRAINT transactions_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- 5. Fundraisers table - created_by references profiles.id
ALTER TABLE fundraisers 
ADD CONSTRAINT fundraisers_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- 6. Teacher requests table - teacher_id references profiles.id
ALTER TABLE teacher_requests 
ADD CONSTRAINT teacher_requests_teacher_id_fkey 
FOREIGN KEY (teacher_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- 7. Messages table - created_by references profiles.id
ALTER TABLE messages 
ADD CONSTRAINT messages_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- =====================================================
-- PHASE 4: VERIFICATION QUERIES
-- =====================================================

-- Verify all new constraints are in place
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND ccu.table_name = 'profiles'
ORDER BY tc.table_name;

-- Verify no constraints still reference users table
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND ccu.table_name = 'users';

COMMIT;

-- =====================================================
-- POST-MIGRATION NOTES
-- =====================================================

/*
IMPORTANT NOTES AFTER MIGRATION:

1. All foreign keys now reference profiles.id instead of users.id
2. Existing data references have been set to NULL (safer approach)
3. New records will need to use profiles.id for user references
4. Application code should already be using profiles table (we fixed this)
5. ON DELETE policies:
   - CASCADE for rsvps (delete RSVPs when user deleted)
   - SET NULL for others (preserve records but remove user reference)

NEXT STEPS:
1. Test application functionality thoroughly
2. Update any remaining application code to use profiles.id
3. Consider if users table can now be safely removed
4. Update documentation to reflect new architecture

ROLLBACK PLAN (if needed):
- Restore from backup taken before migration
- Or reverse the process by dropping new constraints and recreating old ones
*/
