-- Check if first_name and last_name columns exist in production
-- Run this in Supabase SQL Editor to verify column structure

-- Check profiles table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if we have any profiles with names
SELECT 
  id,
  email,
  full_name,
  first_name,
  last_name,
  CASE 
    WHEN first_name IS NOT NULL THEN 'HAS first_name'
    ELSE 'MISSING first_name'
  END as first_name_status,
  CASE 
    WHEN last_name IS NOT NULL THEN 'HAS last_name'
    ELSE 'MISSING last_name'
  END as last_name_status
FROM profiles 
WHERE email LIKE '%sunsetpto.com'
ORDER BY email;

-- If columns don't exist, this will show the error
-- If columns exist but are empty, we'll see NULL values
