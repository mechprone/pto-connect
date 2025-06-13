-- =====================================================
-- PTO Connect - Database Structure Analysis
-- Run this to understand current user table structure
-- =====================================================

-- 1. Check what user-related tables exist
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%user%' OR table_name LIKE '%profile%' OR table_name LIKE '%permission%')
ORDER BY table_name;

-- 2. Analyze profiles table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Analyze users table structure  
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- 4. Check user_permission_matrix structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'user_permission_matrix'
ORDER BY ordinal_position;

-- 5. Check for organization relationships
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND (tc.table_name = 'profiles' OR tc.table_name = 'users' OR tc.table_name = 'user_permission_matrix')
AND tc.table_schema = 'public';

-- 6. Sample data from profiles (first 3 rows)
SELECT * FROM profiles LIMIT 3;

-- 7. Sample data from users (first 3 rows) 
SELECT * FROM users LIMIT 3;

-- 8. Sample data from user_permission_matrix (first 3 rows)
SELECT * FROM user_permission_matrix LIMIT 3;

-- 9. Check if there are existing RLS policies on these tables
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('profiles', 'users', 'user_permission_matrix')
ORDER BY tablename, policyname;

-- 10. Check current auth.uid() function availability
SELECT auth.uid() AS current_user_id;

-- =====================================================
-- Analysis Complete
-- =====================================================
-- This will help determine:
-- 1. Which table stores user-organization relationships
-- 2. How permissions are structured
-- 3. What the correct column names are
-- 4. How to write proper RLS policies
-- =====================================================
