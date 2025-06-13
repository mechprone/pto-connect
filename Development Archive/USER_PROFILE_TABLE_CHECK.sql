-- Check what user profile related tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%profile%' OR table_name LIKE '%user%')
ORDER BY table_name;

-- Check the structure of profiles table if it exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check the structure of user_profiles table if it exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Sample data from profiles table (if exists)
SELECT id, org_id, role, first_name, last_name, email
FROM profiles
LIMIT 5;

-- Sample data from user_profiles table (if exists)
SELECT id, user_id, organization_id, first_name, last_name
FROM user_profiles
LIMIT 5;
