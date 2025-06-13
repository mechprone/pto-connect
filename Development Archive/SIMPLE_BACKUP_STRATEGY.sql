-- SIMPLE BACKUP STRATEGY FOR FREE PLAN
-- This approach is more reliable and works with any table structure
-- Date: June 12, 2025

-- =====================================================
-- STEP 1: GET TABLE STRUCTURES FIRST
-- =====================================================

-- Check profiles table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Check organizations table structure  
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'organizations' 
ORDER BY ordinal_position;

-- =====================================================
-- STEP 2: EXPORT ACTUAL DATA (SIMPLE APPROACH)
-- =====================================================

-- Export profiles data (save this result)
SELECT * FROM profiles;

-- Export organizations data (save this result)
SELECT * FROM organizations;

-- Export any events data (if exists)
SELECT * FROM events;

-- Export any transactions data (empty - skip if no data)  
SELECT * FROM transactions;

-- Export any expenses data (empty - skip if no data)
SELECT * FROM expenses;

-- =====================================================
-- STEP 3: BACKUP CURRENT FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Get current foreign key constraints (CRITICAL for rollback)
SELECT 
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    'ALTER TABLE ' || tc.table_name || 
    ' ADD CONSTRAINT ' || tc.constraint_name ||
    ' FOREIGN KEY (' || kcu.column_name || ')' ||
    ' REFERENCES ' || ccu.table_name || '(' || ccu.column_name || ');' AS restore_command
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;

-- =====================================================
-- STEP 4: COUNT RECORDS (VERIFICATION)
-- =====================================================

-- Verify data counts
SELECT 'profiles' as table_name, COUNT(*) as record_count FROM profiles
UNION ALL
SELECT 'organizations', COUNT(*) FROM organizations  
UNION ALL
SELECT 'events', COUNT(*) FROM events
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'expenses', COUNT(*) FROM expenses
UNION ALL
SELECT 'users', COUNT(*) FROM users;
