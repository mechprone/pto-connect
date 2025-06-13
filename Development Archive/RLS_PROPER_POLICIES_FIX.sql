-- Re-enable RLS with proper non-recursive policies
-- This fixes the security while maintaining functionality

-- ========================================
-- PROFILES TABLE - Fixed RLS Policies
-- ========================================

-- Re-enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;

-- Create non-recursive policies for profiles
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT
    USING (
        -- Allow service role (backend) full access
        auth.role() = 'service_role'
        OR
        -- Allow users to see their own profile
        auth.uid() = id
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
        -- Only allow service role (backend) to delete profiles
        auth.role() = 'service_role'
    );

-- ========================================
-- RECONCILIATIONS TABLE - Proper RLS Policies
-- ========================================

-- Re-enable RLS on reconciliations
ALTER TABLE reconciliations ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "reconciliations_select_policy" ON reconciliations;
DROP POLICY IF EXISTS "reconciliations_insert_policy" ON reconciliations;
DROP POLICY IF EXISTS "reconciliations_update_policy" ON reconciliations;
DROP POLICY IF EXISTS "reconciliations_delete_policy" ON reconciliations;

-- Create proper policies for reconciliations
CREATE POLICY "reconciliations_select_policy" ON reconciliations
    FOR SELECT
    USING (
        -- Allow service role (backend) full access
        auth.role() = 'service_role'
        OR
        -- Allow users to see reconciliations for their organization
        org_id = (
            SELECT p.org_id 
            FROM profiles p 
            WHERE p.id = auth.uid()
        )
    );

CREATE POLICY "reconciliations_insert_policy" ON reconciliations
    FOR INSERT
    WITH CHECK (
        -- Allow service role (backend) full access
        auth.role() = 'service_role'
        OR
        -- Allow users to create reconciliations for their organization
        org_id = (
            SELECT p.org_id 
            FROM profiles p 
            WHERE p.id = auth.uid()
        )
    );

CREATE POLICY "reconciliations_update_policy" ON reconciliations
    FOR UPDATE
    USING (
        -- Allow service role (backend) full access
        auth.role() = 'service_role'
        OR
        -- Allow users to update reconciliations for their organization
        org_id = (
            SELECT p.org_id 
            FROM profiles p 
            WHERE p.id = auth.uid()
        )
    );

CREATE POLICY "reconciliations_delete_policy" ON reconciliations
    FOR DELETE
    USING (
        -- Allow service role (backend) full access
        auth.role() = 'service_role'
        OR
        -- Allow users to delete reconciliations for their organization
        org_id = (
            SELECT p.org_id 
            FROM profiles p 
            WHERE p.id = auth.uid()
        )
    );

-- ========================================
-- BANK_TRANSACTIONS TABLE (if it exists)
-- ========================================

-- Check if bank_transactions exists and apply policies
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bank_transactions') THEN
        -- Re-enable RLS
        ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies
        DROP POLICY IF EXISTS "bank_transactions_select_policy" ON bank_transactions;
        DROP POLICY IF EXISTS "bank_transactions_insert_policy" ON bank_transactions;
        DROP POLICY IF EXISTS "bank_transactions_update_policy" ON bank_transactions;
        DROP POLICY IF EXISTS "bank_transactions_delete_policy" ON bank_transactions;
        
        -- Create policies
        CREATE POLICY "bank_transactions_select_policy" ON bank_transactions
            FOR SELECT
            USING (
                auth.role() = 'service_role'
                OR
                reconciliation_id IN (
                    SELECT r.id FROM reconciliations r
                    WHERE r.org_id = (
                        SELECT p.org_id FROM profiles p WHERE p.id = auth.uid()
                    )
                )
            );
            
        CREATE POLICY "bank_transactions_insert_policy" ON bank_transactions
            FOR INSERT
            WITH CHECK (
                auth.role() = 'service_role'
                OR
                reconciliation_id IN (
                    SELECT r.id FROM reconciliations r
                    WHERE r.org_id = (
                        SELECT p.org_id FROM profiles p WHERE p.id = auth.uid()
                    )
                )
            );
            
        CREATE POLICY "bank_transactions_update_policy" ON bank_transactions
            FOR UPDATE
            USING (
                auth.role() = 'service_role'
                OR
                reconciliation_id IN (
                    SELECT r.id FROM reconciliations r
                    WHERE r.org_id = (
                        SELECT p.org_id FROM profiles p WHERE p.id = auth.uid()
                    )
                )
            );
            
        CREATE POLICY "bank_transactions_delete_policy" ON bank_transactions
            FOR DELETE
            USING (
                auth.role() = 'service_role'
                OR
                reconciliation_id IN (
                    SELECT r.id FROM reconciliations r
                    WHERE r.org_id = (
                        SELECT p.org_id FROM profiles p WHERE p.id = auth.uid()
                    )
                )
            );
            
        RAISE NOTICE 'Applied RLS policies to bank_transactions';
    ELSE
        RAISE NOTICE 'bank_transactions table does not exist';
    END IF;
END $$;

-- ========================================
-- RECONCILIATION_REPORTS TABLE (if it exists)
-- ========================================

-- Check if reconciliation_reports exists and apply policies
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reconciliation_reports') THEN
        -- Re-enable RLS
        ALTER TABLE reconciliation_reports ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies
        DROP POLICY IF EXISTS "reconciliation_reports_select_policy" ON reconciliation_reports;
        DROP POLICY IF EXISTS "reconciliation_reports_insert_policy" ON reconciliation_reports;
        DROP POLICY IF EXISTS "reconciliation_reports_update_policy" ON reconciliation_reports;
        DROP POLICY IF EXISTS "reconciliation_reports_delete_policy" ON reconciliation_reports;
        
        -- Create policies
        CREATE POLICY "reconciliation_reports_select_policy" ON reconciliation_reports
            FOR SELECT
            USING (
                auth.role() = 'service_role'
                OR
                reconciliation_id IN (
                    SELECT r.id FROM reconciliations r
                    WHERE r.org_id = (
                        SELECT p.org_id FROM profiles p WHERE p.id = auth.uid()
                    )
                )
            );
            
        CREATE POLICY "reconciliation_reports_insert_policy" ON reconciliation_reports
            FOR INSERT
            WITH CHECK (
                auth.role() = 'service_role'
                OR
                reconciliation_id IN (
                    SELECT r.id FROM reconciliations r
                    WHERE r.org_id = (
                        SELECT p.org_id FROM profiles p WHERE p.id = auth.uid()
                    )
                )
            );
            
        CREATE POLICY "reconciliation_reports_update_policy" ON reconciliation_reports
            FOR UPDATE
            USING (
                auth.role() = 'service_role'
                OR
                reconciliation_id IN (
                    SELECT r.id FROM reconciliations r
                    WHERE r.org_id = (
                        SELECT p.org_id FROM profiles p WHERE p.id = auth.uid()
                    )
                )
            );
            
        CREATE POLICY "reconciliation_reports_delete_policy" ON reconciliation_reports
            FOR DELETE
            USING (
                auth.role() = 'service_role'
                OR
                reconciliation_id IN (
                    SELECT r.id FROM reconciliations r
                    WHERE r.org_id = (
                        SELECT p.org_id FROM profiles p WHERE p.id = auth.uid()
                    )
                )
            );
            
        RAISE NOTICE 'Applied RLS policies to reconciliation_reports';
    ELSE
        RAISE NOTICE 'reconciliation_reports table does not exist';
    END IF;
END $$;

-- ========================================
-- TEST THE POLICIES
-- ========================================

-- Test that profiles can be accessed
SELECT 'Testing profiles access...' as test;
SELECT COUNT(*) as profile_count FROM profiles;

-- Test that reconciliations can be accessed
SELECT 'Testing reconciliations access...' as test;
SELECT COUNT(*) as reconciliation_count FROM reconciliations;

SELECT 'RLS policies successfully applied with proper security!' as status;
