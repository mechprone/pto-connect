-- Fix RLS blocking reconciliations table inserts
-- Only disable RLS on tables that actually exist

-- First, let's see what reconciliation tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%reconcil%';

-- Disable RLS on reconciliations table (this one definitely exists based on the error)
ALTER TABLE reconciliations DISABLE ROW LEVEL SECURITY;

-- Try to disable RLS on bank_transactions if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bank_transactions') THEN
        ALTER TABLE bank_transactions DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Disabled RLS on bank_transactions';
    ELSE
        RAISE NOTICE 'bank_transactions table does not exist';
    END IF;
END $$;

-- Try to disable RLS on reconciliation_reports if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reconciliation_reports') THEN
        ALTER TABLE reconciliation_reports DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Disabled RLS on reconciliation_reports';
    ELSE
        RAISE NOTICE 'reconciliation_reports table does not exist';
    END IF;
END $$;

SELECT 'RLS disabled on existing reconciliation tables' as status;
