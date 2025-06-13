-- =====================================================
-- PTO Connect - Monthly Reconciliation Module
-- SIMPLIFIED Database Setup Script for Supabase
-- =====================================================
-- This version uses basic RLS policies that work with any user table structure
-- Run this script in the Supabase SQL Editor
-- =====================================================

-- Create expenses table (for tracking actual expenses to reconcile)
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  expense_date DATE NOT NULL,
  category TEXT,
  vendor TEXT,
  payment_method TEXT, -- 'cash', 'check', 'credit_card', 'debit_card', 'bank_transfer'
  check_number TEXT,
  receipt_url TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approval_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  is_reconciled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create reconciliations table
CREATE TABLE IF NOT EXISTS reconciliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  month INT NOT NULL,
  year INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create bank_transactions table
CREATE TABLE IF NOT EXISTS bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reconciliation_id UUID REFERENCES reconciliations(id) ON DELETE CASCADE,
  transaction_date DATE,
  description TEXT,
  amount DECIMAL(10, 2),
  is_matched BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create matched_transactions table
CREATE TABLE IF NOT EXISTS matched_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_transaction_id UUID REFERENCES bank_transactions(id) ON DELETE CASCADE,
  expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
  reconciliation_id UUID REFERENCES reconciliations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create reconciliation_discrepancies table (for unmatched items)
CREATE TABLE IF NOT EXISTS reconciliation_discrepancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reconciliation_id UUID REFERENCES reconciliations(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'unmatched_bank', 'unmatched_expense', 'amount_difference'
  bank_transaction_id UUID REFERENCES bank_transactions(id) ON DELETE CASCADE,
  expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
  description TEXT,
  amount_difference DECIMAL(10, 2),
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'resolved', 'ignored'
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- Enable Row Level Security (RLS) - SIMPLIFIED VERSION
-- =====================================================

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE matched_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliation_discrepancies ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SIMPLIFIED RLS Policies (Basic Security)
-- =====================================================

-- Drop any existing policies
DROP POLICY IF EXISTS "Enable all for authenticated users" ON expenses;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON reconciliations;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON bank_transactions;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON matched_transactions;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON reconciliation_discrepancies;

-- Simple policies that allow authenticated users to access their org's data
-- These can be refined later once we understand your exact user table structure

CREATE POLICY "Enable all for authenticated users" ON expenses
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON reconciliations
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON bank_transactions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON matched_transactions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON reconciliation_discrepancies
  FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- Create indexes for better performance
-- =====================================================

-- Indexes for expenses table
CREATE INDEX IF NOT EXISTS idx_expenses_org_id ON expenses(org_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_is_reconciled ON expenses(is_reconciled);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- Indexes for reconciliations table
CREATE INDEX IF NOT EXISTS idx_reconciliations_org_id ON reconciliations(org_id);
CREATE INDEX IF NOT EXISTS idx_reconciliations_status ON reconciliations(status);
CREATE INDEX IF NOT EXISTS idx_reconciliations_date ON reconciliations(year, month);

-- Indexes for bank_transactions table
CREATE INDEX IF NOT EXISTS idx_bank_transactions_reconciliation_id ON bank_transactions(reconciliation_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_is_matched ON bank_transactions(is_matched);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_date ON bank_transactions(transaction_date);

-- Indexes for matched_transactions table
CREATE INDEX IF NOT EXISTS idx_matched_transactions_reconciliation_id ON matched_transactions(reconciliation_id);
CREATE INDEX IF NOT EXISTS idx_matched_transactions_bank_id ON matched_transactions(bank_transaction_id);
CREATE INDEX IF NOT EXISTS idx_matched_transactions_expense_id ON matched_transactions(expense_id);

-- Indexes for reconciliation_discrepancies table
CREATE INDEX IF NOT EXISTS idx_discrepancies_reconciliation_id ON reconciliation_discrepancies(reconciliation_id);
CREATE INDEX IF NOT EXISTS idx_discrepancies_status ON reconciliation_discrepancies(status);
CREATE INDEX IF NOT EXISTS idx_discrepancies_type ON reconciliation_discrepancies(type);

-- =====================================================
-- Verification queries (run these to confirm setup)
-- =====================================================

-- Check if all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('expenses', 'reconciliations', 'bank_transactions', 'matched_transactions', 'reconciliation_discrepancies');

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('expenses', 'reconciliations', 'bank_transactions', 'matched_transactions', 'reconciliation_discrepancies');

-- Check if policies were created
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('expenses', 'reconciliations', 'bank_transactions', 'matched_transactions', 'reconciliation_discrepancies');

-- =====================================================
-- Setup Complete!
-- =====================================================
-- This simplified version will get your reconciliation module working immediately.
-- 
-- After running this script:
-- 1. Test the reconciliation workflow in the frontend
-- 2. Run DATABASE_STRUCTURE_ANALYSIS.sql to understand your user tables
-- 3. Update RLS policies for proper multi-tenant security
-- 4. Implement OCR functionality for bank statement processing
-- =====================================================
