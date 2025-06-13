-- Check the actual structure of the profiles table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Also check a sample of data to see what's actually there
SELECT * FROM profiles LIMIT 3;
