-- 🔍 PTO Connect Supabase Current State Diagnostic Script
-- Run this in Supabase SQL Editor to get complete current state
-- Date: June 8, 2025

-- =====================================================
-- 1. DATABASE OVERVIEW
-- =====================================================

SELECT 'DATABASE OVERVIEW' as section_title;

-- Get database version and basic info
SELECT 
    version() as postgresql_version,
    current_database() as database_name,
    current_user as current_user,
    now() as current_timestamp;

-- =====================================================
-- 2. ALL TABLES AND THEIR STRUCTURE
-- =====================================================

SELECT 'ALL TABLES AND COLUMNS' as section_title;

-- Get all tables with their columns, types, and constraints
SELECT 
    t.table_schema,
    t.table_name,
    c.column_name,
    c.data_type,
    c.character_maximum_length,
    c.is_nullable,
    c.column_default,
    CASE 
        WHEN pk.column_name IS NOT NULL THEN 'PRIMARY KEY'
        WHEN fk.column_name IS NOT NULL THEN 'FOREIGN KEY -> ' || fk.foreign_table_name || '(' || fk.foreign_column_name || ')'
        ELSE ''
    END as key_type
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON t.table_name = c.table_name AND t.table_schema = c.table_schema
LEFT JOIN (
    SELECT 
        kcu.column_name,
        kcu.table_name,
        kcu.table_schema
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'PRIMARY KEY'
) pk ON c.column_name = pk.column_name AND c.table_name = pk.table_name AND c.table_schema = pk.table_schema
LEFT JOIN (
    SELECT 
        kcu.column_name,
        kcu.table_name,
        kcu.table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
) fk ON c.column_name = fk.column_name AND c.table_name = fk.table_name AND c.table_schema = fk.table_schema
WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name, c.ordinal_position;

-- =====================================================
-- 3. ROW LEVEL SECURITY STATUS
-- =====================================================

SELECT 'ROW LEVEL SECURITY STATUS' as section_title;

-- Check RLS status for all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN 'ENABLED ✅'
        ELSE 'DISABLED ❌'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- =====================================================
-- 4. ALL RLS POLICIES
-- =====================================================

SELECT 'ROW LEVEL SECURITY POLICIES' as section_title;

-- Get all RLS policies with their details
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- 5. INDEXES
-- =====================================================

SELECT 'DATABASE INDEXES' as section_title;

-- Get all indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =====================================================
-- 6. FUNCTIONS AND TRIGGERS
-- =====================================================

SELECT 'CUSTOM FUNCTIONS' as section_title;

-- Get all custom functions
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_result(p.oid) as return_type,
    pg_get_function_arguments(p.oid) as arguments,
    CASE p.provolatile
        WHEN 'i' THEN 'IMMUTABLE'
        WHEN 's' THEN 'STABLE'
        WHEN 'v' THEN 'VOLATILE'
    END as volatility,
    CASE p.prosecdef
        WHEN true THEN 'SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
    END as security
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.prokind = 'f'
ORDER BY p.proname;

SELECT 'TRIGGERS' as section_title;

-- Get all triggers
SELECT 
    t.trigger_name,
    t.event_manipulation,
    t.event_object_table,
    t.action_timing,
    t.action_statement
FROM information_schema.triggers t
WHERE t.trigger_schema = 'public'
ORDER BY t.event_object_table, t.trigger_name;

-- =====================================================
-- 7. FOREIGN KEY RELATIONSHIPS
-- =====================================================

SELECT 'FOREIGN KEY RELATIONSHIPS' as section_title;

-- Get all foreign key relationships
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- =====================================================
-- 8. TABLE SIZES AND ROW COUNTS
-- =====================================================

SELECT 'TABLE SIZES AND ROW COUNTS' as section_title;

-- Get table sizes and row counts
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_stat_get_tuples_returned(c.oid) as rows_returned,
    pg_stat_get_tuples_fetched(c.oid) as rows_fetched,
    pg_stat_get_tuples_inserted(c.oid) as rows_inserted,
    pg_stat_get_tuples_updated(c.oid) as rows_updated,
    pg_stat_get_tuples_deleted(c.oid) as rows_deleted
FROM pg_tables pt
JOIN pg_class c ON c.relname = pt.tablename
WHERE pt.schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- =====================================================
-- 9. SAMPLE DATA FROM KEY TABLES
-- =====================================================

SELECT 'SAMPLE DATA ANALYSIS' as section_title;

-- Check if organizations table exists and get sample data
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations' AND table_schema = 'public') THEN
        RAISE NOTICE 'ORGANIZATIONS TABLE EXISTS';
        PERFORM * FROM organizations LIMIT 1;
    ELSE
        RAISE NOTICE 'ORGANIZATIONS TABLE DOES NOT EXIST';
    END IF;
END $$;

-- Check if profiles table exists and get sample data
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        RAISE NOTICE 'PROFILES TABLE EXISTS';
        PERFORM * FROM profiles LIMIT 1;
    ELSE
        RAISE NOTICE 'PROFILES TABLE DOES NOT EXIST';
    END IF;
END $$;

-- Check if users table exists and get sample data
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        RAISE NOTICE 'USERS TABLE EXISTS';
        PERFORM * FROM users LIMIT 1;
    ELSE
        RAISE NOTICE 'USERS TABLE DOES NOT EXIST';
    END IF;
END $$;

-- =====================================================
-- 10. EXTENSIONS AND SETTINGS
-- =====================================================

SELECT 'INSTALLED EXTENSIONS' as section_title;

-- Get installed extensions
SELECT 
    extname as extension_name,
    extversion as version,
    nspname as schema
FROM pg_extension e
JOIN pg_namespace n ON e.extnamespace = n.oid
ORDER BY extname;

-- =====================================================
-- 11. AUTHENTICATION SCHEMA (auth.users)
-- =====================================================

SELECT 'SUPABASE AUTH SCHEMA' as section_title;

-- Check auth.users table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'auth' 
    AND table_name = 'users'
ORDER BY ordinal_position;

-- Get count of auth users
SELECT 
    'auth.users' as table_name,
    COUNT(*) as total_users,
    COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmed_users,
    COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as active_users
FROM auth.users;

-- =====================================================
-- 12. CURRENT SCHEMA VERSION CHECK
-- =====================================================

SELECT 'SCHEMA VERSION CHECK' as section_title;

-- Check for specific columns that indicate schema version
SELECT 
    'org_id column exists in profiles' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' 
            AND column_name = 'org_id' 
            AND table_schema = 'public'
        ) THEN 'YES ✅'
        ELSE 'NO ❌'
    END as result;

SELECT 
    'organizations table exists' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'organizations' 
            AND table_schema = 'public'
        ) THEN 'YES ✅'
        ELSE 'NO ❌'
    END as result;

SELECT 
    'get_user_org_id function exists' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public'
            AND p.proname = 'get_user_org_id'
        ) THEN 'YES ✅'
        ELSE 'NO ❌'
    END as result;

-- =====================================================
-- END OF DIAGNOSTIC SCRIPT
-- =====================================================

SELECT 'DIAGNOSTIC COMPLETE' as section_title, now() as completed_at;

-- Instructions for running this script:
-- 1. Copy this entire script
-- 2. Go to Supabase Dashboard > SQL Editor
-- 3. Paste the script and click "Run"
-- 4. Copy all results and share with your AI assistant
-- 5. This will provide the most accurate current state of your database
