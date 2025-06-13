-- Fix infinite recursion in RLS policies for profiles table
-- The previous policy was trying to query profiles table to determine access to profiles table

-- First, drop the problematic policies
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- Create corrected policies without recursion
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT
    USING (
        -- Allow service role (backend) full access
        auth.role() = 'service_role'
        OR
        -- Allow users to see their own profile
        auth.uid() = id
        OR
        -- Allow users to see other profiles in their organization (using a different approach)
        EXISTS (
            SELECT 1 FROM organizations o
            WHERE o.id = profiles.org_id
            AND o.id IN (
                SELECT p.org_id FROM profiles p 
                WHERE p.id = auth.uid()
            )
        )
    );

CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT
    WITH CHECK (
        -- Allow service role (backend) full access
        auth.role() = 'service_role'
        OR
        -- Allow authenticated users to insert their own profile
        auth.uid() = id
    );

CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE
    USING (
        -- Allow service role (backend) full access
        auth.role() = 'service_role'
        OR
        -- Allow users to update their own profile
        auth.uid() = id
    );

CREATE POLICY "profiles_delete_policy" ON profiles
    FOR DELETE
    USING (
        -- Allow service role (backend) full access
        auth.role() = 'service_role'
    );

-- Test the fix
SELECT id, email, first_name, last_name, org_id, role, approved 
FROM profiles 
WHERE id = 'a7937b50-272e-4d44-a48e-a0909aeb66ab';
