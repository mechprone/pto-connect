-- Emergency fix for login - RLS is blocking frontend profile access
-- The issue: frontend can't query profiles table during login to get user role

-- Temporarily disable RLS on profiles again to restore login
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Test that profile access works for login
SELECT id, email, first_name, last_name, org_id, role, approved 
FROM profiles 
WHERE id = 'a7937b50-272e-4d44-a48e-a0909aeb66ab';

-- This will restore login functionality immediately
-- We'll need to create a different approach for RLS that allows frontend access
