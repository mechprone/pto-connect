-- Manual Database Backup for Supabase Free Plan
-- Since automated backups require Pro plan, we'll create manual data exports
-- Date: June 12, 2025

-- =====================================================
-- MANUAL BACKUP STRATEGY FOR FREE PLAN
-- =====================================================

-- Step 1: Export all critical table data as INSERT statements
-- Run each query and save the results

-- 1. First, check the actual structure of profiles table
-- Run this query first to see the actual columns:
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. Backup profiles table (most critical) - CORRECTED VERSION
-- This will work regardless of exact column structure
SELECT 'INSERT INTO profiles (' ||
       string_agg(column_name, ', ') ||
       ') VALUES (' ||
       string_agg(
         CASE 
           WHEN data_type IN ('text', 'character varying', 'uuid') 
           THEN '''[' || column_name || ']'''
           ELSE '[' || column_name || ']'
         END, 
         ', '
       ) || ');'
FROM information_schema.columns 
WHERE table_name = 'profiles' 
GROUP BY table_name;

-- 3. Get actual data from profiles table
SELECT * FROM profiles;

-- 2. Backup organizations table
SELECT 'INSERT INTO organizations (id, name, type, subdomain, created_at, updated_at) VALUES (' ||
       '''' || id || ''', ' ||
       '''' || name || ''', ' ||
       '''' || COALESCE(type, 'NULL') || ''', ' ||
       '''' || COALESCE(subdomain, 'NULL') || ''', ' ||
       '''' || created_at || ''', ' ||
       '''' || updated_at || ''');'
FROM organizations;

-- 3. Backup events table (if any data exists)
SELECT 'INSERT INTO events (id, title, description, event_date, location, event_lead, org_id, created_at, updated_at) VALUES (' ||
       '''' || id || ''', ' ||
       '''' || title || ''', ' ||
       '''' || COALESCE(description, 'NULL') || ''', ' ||
       '''' || event_date || ''', ' ||
       '''' || COALESCE(location, 'NULL') || ''', ' ||
       COALESCE('''' || event_lead || '''', 'NULL') || ', ' ||
       '''' || org_id || ''', ' ||
       '''' || created_at || ''', ' ||
       '''' || updated_at || ''');'
FROM events
WHERE EXISTS (SELECT 1 FROM events);

-- 4. Backup transactions table (if any data exists)
SELECT 'INSERT INTO transactions (id, description, amount, transaction_date, category, created_by, org_id, created_at, updated_at) VALUES (' ||
       '''' || id || ''', ' ||
       '''' || description || ''', ' ||
       amount || ', ' ||
       '''' || transaction_date || ''', ' ||
       '''' || COALESCE(category, 'NULL') || ''', ' ||
       COALESCE('''' || created_by || '''', 'NULL') || ', ' ||
       '''' || org_id || ''', ' ||
       '''' || created_at || ''', ' ||
       '''' || updated_at || ''');'
FROM transactions
WHERE EXISTS (SELECT 1 FROM transactions);

-- 5. Backup expense_submissions table (if any data exists)
SELECT 'INSERT INTO expense_submissions (id, description, amount, receipt_url, status, submitted_by, approved_by, org_id, created_at, updated_at) VALUES (' ||
       '''' || id || ''', ' ||
       '''' || description || ''', ' ||
       amount || ', ' ||
       '''' || COALESCE(receipt_url, 'NULL') || ''', ' ||
       '''' || status || ''', ' ||
       '''' || submitted_by || ''', ' ||
       COALESCE('''' || approved_by || '''', 'NULL') || ', ' ||
       '''' || org_id || ''', ' ||
       '''' || created_at || ''', ' ||
       '''' || updated_at || ''');'
FROM expense_submissions
WHERE EXISTS (SELECT 1 FROM expense_submissions);

-- =====================================================
-- SCHEMA BACKUP (Table Structure)
-- =====================================================

-- Get table creation statements (run this to see table structures)
SELECT 
    'CREATE TABLE ' || table_name || ' (' ||
    string_agg(
        column_name || ' ' || data_type ||
        CASE 
            WHEN character_maximum_length IS NOT NULL 
            THEN '(' || character_maximum_length || ')'
            ELSE ''
        END ||
        CASE 
            WHEN is_nullable = 'NO' THEN ' NOT NULL'
            ELSE ''
        END ||
        CASE 
            WHEN column_default IS NOT NULL 
            THEN ' DEFAULT ' || column_default
            ELSE ''
        END,
        ', '
    ) || ');'
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'organizations', 'events', 'transactions', 'expense_submissions', 'users')
GROUP BY table_name
ORDER BY table_name;

-- =====================================================
-- CONSTRAINT BACKUP
-- =====================================================

-- Get current foreign key constraints
SELECT 
    'ALTER TABLE ' || tc.table_name || 
    ' ADD CONSTRAINT ' || tc.constraint_name ||
    ' FOREIGN KEY (' || kcu.column_name || ')' ||
    ' REFERENCES ' || ccu.table_name || '(' || ccu.column_name || ');'
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;
