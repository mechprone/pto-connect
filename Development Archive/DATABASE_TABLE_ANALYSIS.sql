-- Analyze the structure of both users and profiles tables
-- to determine which one contains the organizational context

-- 1. Check structure of 'users' table
SELECT 'users_table_structure' as analysis_type, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check structure of 'profiles' table  
SELECT 'profiles_table_structure' as analysis_type, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Sample data from users table (first 3 records)
SELECT 'users_sample_data' as analysis_type, *
FROM users
LIMIT 3;

-- 4. Sample data from profiles table (first 3 records)
SELECT 'profiles_sample_data' as analysis_type, *
FROM profiles
LIMIT 3;

-- 5. Check if users table has org_id
SELECT 'users_org_check' as analysis_type, 
       CASE WHEN EXISTS (
         SELECT 1 FROM information_schema.columns 
         WHERE table_name = 'users' AND column_name = 'org_id'
       ) THEN 'users table HAS org_id column'
       ELSE 'users table does NOT have org_id column'
       END as result;

-- 6. Check if profiles table has org_id
SELECT 'profiles_org_check' as analysis_type,
       CASE WHEN EXISTS (
         SELECT 1 FROM information_schema.columns 
         WHERE table_name = 'profiles' AND column_name = 'org_id'
       ) THEN 'profiles table HAS org_id column'
       ELSE 'profiles table does NOT have org_id column'
       END as result;

-- 7. Count records in each table
SELECT 'record_counts' as analysis_type, 
       (SELECT COUNT(*) FROM users) as users_count,
       (SELECT COUNT(*) FROM profiles) as profiles_count;
