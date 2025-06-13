-- =====================================================
-- Reconciliation Tables Verification Query
-- Run this in Supabase SQL Editor to confirm setup
-- =====================================================

-- Check if all reconciliation tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IS NOT NULL THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'expenses', 
  'reconciliations', 
  'bank_transactions', 
  'matched_transactions', 
  'reconciliation_discrepancies'
)
ORDER BY table_name;

-- Check table row counts (should be 0 for new setup)
SELECT 
  'expenses' as table_name,
  COUNT(*) as row_count
FROM expenses
UNION ALL
SELECT 
  'reconciliations' as table_name,
  COUNT(*) as row_count
FROM reconciliations
UNION ALL
SELECT 
  'bank_transactions' as table_name,
  COUNT(*) as row_count
FROM bank_transactions
UNION ALL
SELECT 
  'matched_transactions' as table_name,
  COUNT(*) as row_count
FROM matched_transactions
UNION ALL
SELECT 
  'reconciliation_discrepancies' as table_name,
  COUNT(*) as row_count
FROM reconciliation_discrepancies;

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  CASE 
    WHEN policyname IS NOT NULL THEN '✅ ENABLED'
    ELSE '❌ MISSING'
  END as rls_status
FROM pg_policies 
WHERE tablename IN (
  'expenses', 
  'reconciliations', 
  'bank_transactions', 
  'matched_transactions', 
  'reconciliation_discrepancies'
)
ORDER BY tablename, policyname;
