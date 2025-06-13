-- Working RLS Solution - Accounts for frontend anon access and backend service role
-- This approach will maintain security while preserving functionality

-- ========================================
-- PROFILES TABLE - Frontend-Compatible RLS
-- ========================================

-- Re-enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- Create policies that work with frontend anon access
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT
    USING (
        -- Allow service role (backend) full access
        auth.role() = 'service_role'
        OR
        -- Allow anon role (frontend) to read profiles for login
        auth.role() = 'anon'
        OR
        -- Allow authenticated users to see their own profile
        auth.uid() = id
    );

CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT
    WITH CHECK (
        -- Allow service role (backend) full access
        auth.role() = 'service_role'
        OR
        -- Allow anon role (frontend) to create profiles during signup
        auth.role() = 'anon'
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
        -- Only allow service role (backend) to delete profiles
        auth.role() = 'service_role'
    );

-- ========================================
-- RECONCILIATIONS TABLE - Service Role Access
-- ========================================

-- Re-enable RLS on reconciliations
ALTER TABLE reconciliations ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "reconciliations_select_policy" ON reconciliations;
DROP POLICY IF EXISTS "reconciliations_insert_policy" ON reconciliations;
DROP POLICY IF EXISTS "reconciliations_update_policy" ON reconciliations;
DROP POLICY IF EXISTS "reconciliations_delete_policy" ON reconciliations;

-- Create policies that prioritize service role access
CREATE POLICY "reconciliations_select_policy" ON reconciliations
    FOR SELECT
    USING (
        -- Allow service role (backend) full access - PRIORITY
        auth.role() = 'service_role'
        OR
        -- Allow users to see reconciliations for their organization
        (
            auth.role() = 'authenticated' 
            AND org_id = (
                SELECT p.org_id 
                FROM profiles p 
                WHERE p.id = auth.uid()
            )
        )
    );

CREATE POLICY "reconciliations_insert_policy" ON reconciliations
    FOR INSERT
    WITH CHECK (
        -- Allow service role (backend) full access - PRIORITY
        auth.role() = 'service_role'
        OR
        -- Allow authenticated users to create reconciliations for their organization
        (
            auth.role() = 'authenticated'
            AND org_id = (
                SELECT p.org_id 
                FROM profiles p 
                WHERE p.id = auth.uid()
            )
        )
    );

CREATE POLICY "reconciliations_update_policy" ON reconciliations
    FOR UPDATE
    USING (
        -- Allow service role (backend) full access - PRIORITY
        auth.role() = 'service_role'
        OR
        -- Allow users to update reconciliations for their organization
        (
            auth.role() = 'authenticated'
            AND org_id = (
                SELECT p.org_id 
                FROM profiles p 
                WHERE p.id = auth.uid()
            )
        )
    );

CREATE POLICY "reconciliations_delete_policy" ON reconciliations
    FOR DELETE
    USING (
        -- Allow service role (backend) full access - PRIORITY
        auth.role() = 'service_role'
        OR
        -- Allow users to delete reconciliations for their organization
        (
            auth.role() = 'authenticated'
            AND org_id = (
                SELECT p.org_id 
                FROM profiles p 
                WHERE p.id = auth.uid()
            )
        )
    );

-- ========================================
-- TEST THE SOLUTION
-- ========================================

-- Test profiles access (should work for anon and service roles)
SELECT 'Testing profiles access...' as test;
SELECT COUNT(*) as profile_count FROM profiles;

-- Test reconciliations access (should work for service role)
SELECT 'Testing reconciliations access...' as test;
SELECT COUNT(*) as reconciliation_count FROM reconciliations;

-- Show current auth context for debugging
SELECT 
    'Current auth context:' as info,
    auth.role() as current_role,
    auth.uid() as current_user_id;

SELECT 'RLS policies applied with frontend and backend compatibility!' as status;
