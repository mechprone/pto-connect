-- 🔍 Complete Database Diagnostic - Run Each Query Separately
-- Copy results from each query before running the next

-- =====================================================
-- QUERY 1: RLS POLICIES STATUS
-- =====================================================
-- Check which tables have RLS enabled and their policies
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
-- QUERY 2: ALL RLS POLICIES DETAILS
-- =====================================================
-- Get all RLS policies with their conditions
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command_type,
    qual as policy_condition,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- QUERY 3: FOREIGN KEY RELATIONSHIPS
-- =====================================================
-- Check all foreign key constraints
SELECT 
    tc.table_name as source_table,
    kcu.column_name as source_column,
    ccu.table_name AS target_table,
    ccu.column_name AS target_column,
    tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- =====================================================
-- QUERY 4: CUSTOM FUNCTIONS (especially get_user_org_id)
-- =====================================================
-- Check for multi-tenant helper functions
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_result(p.oid) as return_type,
    pg_get_function_arguments(p.oid) as arguments,
    CASE p.prosecdef
        WHEN true THEN 'SECURITY DEFINER'
        ELSE 'SECURITY INVOKER'
    END as security
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.prokind = 'f'
ORDER BY p.proname;

-- =====================================================
-- QUERY 5: TABLE ROW COUNTS AND DATA STATUS
-- =====================================================
-- Check which tables have data (to understand migration needs)
SELECT 
    'organizations' as table_name,
    COUNT(*) as row_count
FROM organizations
UNION ALL
SELECT 
    'profiles' as table_name,
    COUNT(*) as row_count
FROM profiles
UNION ALL
SELECT 
    'users' as table_name,
    COUNT(*) as row_count
FROM users
UNION ALL
SELECT 
    'ptos' as table_name,
    COUNT(*) as row_count
FROM ptos
UNION ALL
SELECT 
    'events' as table_name,
    COUNT(*) as row_count
FROM events
UNION ALL
SELECT 
    'event_rsvps' as table_name,
    COUNT(*) as row_count
FROM event_rsvps
UNION ALL
SELECT 
    'rsvps' as table_name,
    COUNT(*) as row_count
FROM rsvps
ORDER BY table_name;

-- =====================================================
-- QUERY 6: SAMPLE DATA FROM KEY TABLES
-- =====================================================
-- Get sample data to understand current structure
SELECT 
    'organizations_sample' as data_type,
    id,
    name,
    signup_code,
    subscription_status,
    created_at
FROM organizations 
LIMIT 3;

-- =====================================================
-- QUERY 7: PROFILE TO ORGANIZATION RELATIONSHIPS
-- =====================================================
-- Check how profiles are linked to organizations
SELECT 
    p.id as profile_id,
    p.email,
    p.role,
    p.org_id,
    o.name as org_name,
    o.signup_code
FROM profiles p
LEFT JOIN organizations o ON p.org_id = o.id
LIMIT 5;

-- =====================================================
-- QUERY 8: AUTH.USERS TO PROFILES RELATIONSHIP
-- =====================================================
-- Check how Supabase auth.users connects to profiles
SELECT 
    au.id as auth_user_id,
    au.email as auth_email,
    au.created_at as auth_created,
    p.id as profile_id,
    p.email as profile_email,
    p.org_id,
    p.role
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
LIMIT 5;

-- =====================================================
-- QUERY 9: INDEXES AND PERFORMANCE
-- =====================================================
-- Check database indexes for performance
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
    AND (indexname LIKE '%org_id%' OR indexname LIKE '%organization%')
ORDER BY tablename, indexname;

-- =====================================================
-- QUERY 10: CONSTRAINT VIOLATIONS CHECK
-- =====================================================
-- Check for any constraint violations that might prevent cleanup
SELECT 
    conname as constraint_name,
    conrelid::regclass as table_name,
    confrelid::regclass as referenced_table,
    contype as constraint_type
FROM pg_constraint 
WHERE connamespace = 'public'::regnamespace
    AND contype IN ('f', 'p', 'u')
ORDER BY table_name, constraint_name;
