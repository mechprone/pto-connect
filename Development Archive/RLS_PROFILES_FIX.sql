-- Fix RLS policies on profiles table to allow service role access
-- This will resolve the "JSON object requested, multiple (or no) rows returned" error

-- First, check current RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

-- Disable RLS temporarily to test
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Test query to verify access
SELECT id, email, first_name, last_name, org_id, role, approved 
FROM profiles 
WHERE id = 'a7937b50-272e-4d44-a48e-a0909aeb66ab';

-- Re-enable RLS with proper policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies that might be blocking service role
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- Create new policies that allow service role access
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT
    USING (
        -- Allow service role (backend) full access
        auth.role() = 'service_role'
        OR
        -- Allow authenticated users to see profiles in their organization
        (auth.uid() IS NOT NULL AND org_id IN (
            SELECT org_id FROM profiles WHERE id = auth.uid()
        ))
    );

CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT
    WITH CHECK (
        -- Allow service role (backend) full access
        auth.role() = 'service_role'
        OR
        -- Allow authenticated users to insert profiles in their organization
        (auth.uid() IS NOT NULL AND org_id IN (
            SELECT org_id FROM profiles WHERE id = auth.uid()
        ))
    );

CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE
    USING (
        -- Allow service role (backend) full access
        auth.role() = 'service_role'
        OR
        -- Allow users to update their own profile
        auth.uid() = id
        OR
        -- Allow admins to update profiles in their organization
        (auth.uid() IS NOT NULL AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin' 
            AND org_id = profiles.org_id
        ))
    );

CREATE POLICY "profiles_delete_policy" ON profiles
    FOR DELETE
    USING (
        -- Allow service role (backend) full access
        auth.role() = 'service_role'
        OR
        -- Allow admins to delete profiles in their organization
        (auth.uid() IS NOT NULL AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin' 
            AND org_id = profiles.org_id
        ))
    );

-- Verify the fix works
SELECT id, email, first_name, last_name, org_id, role, approved 
FROM profiles 
WHERE id = 'a7937b50-272e-4d44-a48e-a0909aeb66ab';
