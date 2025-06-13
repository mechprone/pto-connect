-- Quick fix for production reconciliation tables
-- Run this in Supabase SQL Editor to create the missing tables

-- Create reconciliations table if it doesn't exist
CREATE TABLE IF NOT EXISTS reconciliations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2030),
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    
    -- Ensure one reconciliation per org per month/year
    UNIQUE(org_id, month, year)
);

-- Create bank_transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS bank_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reconciliation_id UUID NOT NULL REFERENCES reconciliations(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    is_matched BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create matched_transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS matched_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reconciliation_id UUID NOT NULL REFERENCES reconciliations(id) ON DELETE CASCADE,
    bank_transaction_id UUID NOT NULL REFERENCES bank_transactions(id) ON DELETE CASCADE,
    expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure each bank transaction can only be matched once
    UNIQUE(bank_transaction_id),
    -- Ensure each expense can only be matched once per reconciliation
    UNIQUE(reconciliation_id, expense_id)
);

-- Enable RLS on all tables
ALTER TABLE reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE matched_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for reconciliations
CREATE POLICY "Users can view reconciliations for their organization" ON reconciliations
    FOR SELECT USING (
        org_id IN (
            SELECT org_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can create reconciliations for their organization" ON reconciliations
    FOR INSERT WITH CHECK (
        org_id IN (
            SELECT org_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update reconciliations for their organization" ON reconciliations
    FOR UPDATE USING (
        org_id IN (
            SELECT org_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Create RLS policies for bank_transactions
CREATE POLICY "Users can view bank transactions for their reconciliations" ON bank_transactions
    FOR SELECT USING (
        reconciliation_id IN (
            SELECT id FROM reconciliations WHERE org_id IN (
                SELECT org_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create bank transactions for their reconciliations" ON bank_transactions
    FOR INSERT WITH CHECK (
        reconciliation_id IN (
            SELECT id FROM reconciliations WHERE org_id IN (
                SELECT org_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

-- Create RLS policies for matched_transactions
CREATE POLICY "Users can view matched transactions for their reconciliations" ON matched_transactions
    FOR SELECT USING (
        reconciliation_id IN (
            SELECT id FROM reconciliations WHERE org_id IN (
                SELECT org_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create matched transactions for their reconciliations" ON matched_transactions
    FOR INSERT WITH CHECK (
        reconciliation_id IN (
            SELECT id FROM reconciliations WHERE org_id IN (
                SELECT org_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reconciliations_org_id ON reconciliations(org_id);
CREATE INDEX IF NOT EXISTS idx_reconciliations_month_year ON reconciliations(month, year);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_reconciliation_id ON bank_transactions(reconciliation_id);
CREATE INDEX IF NOT EXISTS idx_matched_transactions_reconciliation_id ON matched_transactions(reconciliation_id);

-- Grant permissions
GRANT ALL ON reconciliations TO authenticated;
GRANT ALL ON bank_transactions TO authenticated;
GRANT ALL ON matched_transactions TO authenticated;

SELECT 'Reconciliation tables created successfully!' as result;
