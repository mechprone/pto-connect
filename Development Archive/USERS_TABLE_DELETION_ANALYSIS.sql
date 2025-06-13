-- Analysis of users table before potential deletion
-- Check for foreign key constraints and references

-- 1. Check if any tables reference the users table
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

-- 2. Check current structure of users table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 3. Verify users table is indeed empty
SELECT COUNT(*) as user_count FROM users;

-- 4. Check if there are any views that reference users table
SELECT table_name, view_definition 
FROM information_schema.views 
WHERE view_definition ILIKE '%users%';

-- 5. Check for any triggers on users table
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users';
