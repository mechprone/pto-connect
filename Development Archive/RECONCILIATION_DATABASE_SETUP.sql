-- =====================================================
-- PTO Connect - Monthly Reconciliation Module
-- Database Setup Script for Supabase
-- =====================================================
-- Run this script in the Supabase SQL Editor to create
-- all necessary tables and policies for the reconciliation module
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
-- Enable Row Level Security (RLS)
-- =====================================================

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE matched_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliation_discrepancies ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS Policies for expenses table
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view expenses for their organization" ON expenses;
DROP POLICY IF EXISTS "Treasurers and above can manage expenses" ON expenses;

-- Users can view expenses for their organization
CREATE POLICY "Users can view expenses for their organization" ON expenses
  FOR SELECT USING (
    org_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Treasurers and above can manage expenses
CREATE POLICY "Treasurers and above can manage expenses" ON expenses
  FOR ALL USING (
    org_id IN (
      SELECT ur.organization_id FROM user_roles ur
      JOIN user_profiles up ON ur.user_id = up.user_id
      WHERE up.user_id = auth.uid()
      AND ur.role_type IN ('admin', 'board_member', 'treasurer', 'committee_lead')
    )
  );

-- =====================================================
-- RLS Policies for reconciliations table
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view reconciliations for their organization" ON reconciliations;
DROP POLICY IF EXISTS "Treasurers and above can manage reconciliations" ON reconciliations;

-- Users can view reconciliations for their organization
CREATE POLICY "Users can view reconciliations for their organization" ON reconciliations
  FOR SELECT USING (
    org_id IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Treasurers and above can manage reconciliations
CREATE POLICY "Treasurers and above can manage reconciliations" ON reconciliations
  FOR ALL USING (
    org_id IN (
      SELECT ur.organization_id FROM user_roles ur
      JOIN user_profiles up ON ur.user_id = up.user_id
      WHERE up.user_id = auth.uid()
      AND ur.role_type IN ('admin', 'board_member', 'treasurer', 'committee_lead')
    )
  );

-- =====================================================
-- RLS Policies for bank_transactions table
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view bank transactions for their organization" ON bank_transactions;
DROP POLICY IF EXISTS "Treasurers and above can manage bank transactions" ON bank_transactions;

-- Users can view bank transactions for their organization
CREATE POLICY "Users can view bank transactions for their organization" ON bank_transactions
  FOR SELECT USING (
    (
      SELECT org_id FROM reconciliations WHERE id = reconciliation_id
    ) IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Treasurers and above can manage bank transactions
CREATE POLICY "Treasurers and above can manage bank transactions" ON bank_transactions
  FOR ALL USING (
    (
      SELECT org_id FROM reconciliations WHERE id = reconciliation_id
    ) IN (
      SELECT ur.organization_id FROM user_roles ur
      JOIN user_profiles up ON ur.user_id = up.user_id
      WHERE up.user_id = auth.uid()
      AND ur.role_type IN ('admin', 'board_member', 'treasurer', 'committee_lead')
    )
  );

-- =====================================================
-- RLS Policies for matched_transactions table
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view matched transactions for their organization" ON matched_transactions;
DROP POLICY IF EXISTS "Treasurers and above can manage matched transactions" ON matched_transactions;

-- Users can view matched transactions for their organization
CREATE POLICY "Users can view matched transactions for their organization" ON matched_transactions
  FOR SELECT USING (
    (
      SELECT org_id FROM reconciliations WHERE id = reconciliation_id
    ) IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Treasurers and above can manage matched transactions
CREATE POLICY "Treasurers and above can manage matched transactions" ON matched_transactions
  FOR ALL USING (
    (
      SELECT org_id FROM reconciliations WHERE id = reconciliation_id
    ) IN (
      SELECT ur.organization_id FROM user_roles ur
      JOIN user_profiles up ON ur.user_id = up.user_id
      WHERE up.user_id = auth.uid()
      AND ur.role_type IN ('admin', 'board_member', 'treasurer', 'committee_lead')
    )
  );

-- =====================================================
-- RLS Policies for reconciliation_discrepancies table
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view discrepancies for their organization" ON reconciliation_discrepancies;
DROP POLICY IF EXISTS "Treasurers and above can manage discrepancies" ON reconciliation_discrepancies;

-- Users can view discrepancies for their organization
CREATE POLICY "Users can view discrepancies for their organization" ON reconciliation_discrepancies
  FOR SELECT USING (
    (
      SELECT org_id FROM reconciliations WHERE id = reconciliation_id
    ) IN (
      SELECT organization_id FROM user_profiles 
      WHERE user_id = auth.uid()
    )
  );

-- Treasurers and above can manage discrepancies
CREATE POLICY "Treasurers and above can manage discrepancies" ON reconciliation_discrepancies
  FOR ALL USING (
    (
      SELECT org_id FROM reconciliations WHERE id = reconciliation_id
    ) IN (
      SELECT ur.organization_id FROM user_roles ur
      JOIN user_profiles up ON ur.user_id = up.user_id
      WHERE up.user_id = auth.uid()
      AND ur.role_type IN ('admin', 'board_member', 'treasurer', 'committee_lead')
    )
  );

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
-- Insert sample data for testing (optional)
-- =====================================================

-- Uncomment the following lines if you want to insert sample data for testing
-- Note: Replace 'your-org-id-here' with an actual organization ID from your organizations table

/*
-- Sample reconciliation
INSERT INTO reconciliations (org_id, month, year, status) 
VALUES ('your-org-id-here', 10, 2024, 'completed');

-- Sample bank transactions (replace reconciliation_id with the actual ID from above)
INSERT INTO bank_transactions (reconciliation_id, transaction_date, description, amount, is_matched)
VALUES 
  ('reconciliation-id-here', '2024-10-15', 'Fall Festival Supplies - Home Depot', -245.67, true),
  ('reconciliation-id-here', '2024-10-18', 'Book Fair Revenue - Cash Deposit', 1250.00, true),
  ('reconciliation-id-here', '2024-10-22', 'Office Supplies - Staples', -89.43, false);
*/

-- =====================================================
-- Verification queries (run these to confirm setup)
-- =====================================================

-- Check if all tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('reconciliations', 'bank_transactions', 'matched_transactions', 'reconciliation_discrepancies');

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('reconciliations', 'bank_transactions', 'matched_transactions', 'reconciliation_discrepancies');

-- Check if policies were created
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('reconciliations', 'bank_transactions', 'matched_transactions', 'reconciliation_discrepancies');

-- =====================================================
-- Setup Complete!
-- =====================================================
-- After running this script, your reconciliation module
-- database tables will be ready for use.
-- 
-- Next steps:
-- 1. Test the reconciliation workflow in the frontend
-- 2. Implement OCR functionality for bank statement processing
-- 3. Add smart matching algorithms
-- 4. Create comprehensive reporting features
-- =====================================================
