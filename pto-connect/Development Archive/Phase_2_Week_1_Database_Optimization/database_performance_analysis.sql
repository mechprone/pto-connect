-- 🚀 Phase 2: Database Performance Analysis & Optimization
-- Week 1, Sprint 2.1A: Permission System Performance Baseline

-- ============================================================================
-- PERMISSION SYSTEM PERFORMANCE ANALYSIS
-- ============================================================================

-- 1. Current Permission System Table Analysis
-- ============================================================================

-- Analyze organization_permissions table structure and performance
SELECT 
  schemaname,
  tablename,
  attname as column_name,
  n_distinct,
  correlation,
  most_common_vals[1:3] as top_values,
  most_common_freqs[1:3] as frequencies
FROM pg_stats 
WHERE tablename = 'organization_permissions'
ORDER BY attname;

-- Analyze organization_permission_templates table
SELECT 
  schemaname,
  tablename,
  attname as column_name,
  n_distinct,
  correlation,
  most_common_vals[1:3] as top_values,
  most_common_freqs[1:3] as frequencies
FROM pg_stats 
WHERE tablename = 'organization_permission_templates'
ORDER BY attname;

-- Analyze profiles table for permission-related queries
SELECT 
  schemaname,
  tablename,
  attname as column_name,
  n_distinct,
  correlation,
  most_common_vals[1:3] as top_values,
  most_common_freqs[1:3] as frequencies
FROM pg_stats 
WHERE tablename = 'profiles' 
  AND attname IN ('org_id', 'role', 'user_id')
ORDER BY attname;

-- ============================================================================
-- 2. Current Index Analysis
-- ============================================================================

-- Check existing indexes on permission-related tables
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('organization_permissions', 'organization_permission_templates', 'profiles')
ORDER BY tablename, indexname;

-- Analyze index usage statistics
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_tup_read,
  idx_tup_fetch,
  idx_scan,
  CASE 
    WHEN idx_scan = 0 THEN 'UNUSED'
    WHEN idx_tup_read = 0 THEN 'NEVER_READ'
    ELSE 'ACTIVE'
  END as index_status
FROM pg_stat_user_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('organization_permissions', 'organization_permission_templates', 'profiles')
ORDER BY tablename, idx_scan DESC;

-- ============================================================================
-- 3. Query Performance Analysis
-- ============================================================================

-- Enable pg_stat_statements if not already enabled
-- CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Analyze permission-related query performance
-- Note: This requires pg_stat_statements extension
SELECT 
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time,
  rows,
  100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements 
WHERE query ILIKE '%organization_permission%'
   OR query ILIKE '%user_has_org_permission%'
   OR query ILIKE '%profiles%'
ORDER BY mean_exec_time DESC
LIMIT 20;

-- ============================================================================
-- 4. Table Size and Growth Analysis
-- ============================================================================

-- Analyze table sizes for permission system
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size,
  (SELECT count(*) FROM information_schema.tables WHERE table_name = tablename) as row_count_estimate
FROM pg_tables 
WHERE tablename IN ('organization_permissions', 'organization_permission_templates', 'profiles', 'organizations')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================================================
-- 5. Permission System Data Distribution Analysis
-- ============================================================================

-- Analyze organization distribution
SELECT 
  'organizations' as table_name,
  count(*) as total_records,
  count(DISTINCT id) as unique_orgs
FROM organizations;

-- Analyze permission template distribution
SELECT 
  'permission_templates' as table_name,
  count(*) as total_templates,
  count(DISTINCT module_name) as unique_modules,
  count(DISTINCT permission_key) as unique_permissions
FROM organization_permission_templates;

-- Analyze organization permissions distribution
SELECT 
  'org_permissions' as table_name,
  count(*) as total_custom_permissions,
  count(DISTINCT org_id) as orgs_with_custom_permissions,
  count(DISTINCT permission_key) as customized_permission_types,
  avg(CASE WHEN is_enabled THEN 1 ELSE 0 END) as avg_enabled_rate
FROM organization_permissions;

-- Analyze user distribution by organization and role
SELECT 
  org_id,
  role,
  count(*) as user_count
FROM profiles 
WHERE org_id IS NOT NULL
GROUP BY org_id, role
ORDER BY org_id, role;

-- ============================================================================
-- 6. Permission System Function Performance Analysis
-- ============================================================================

-- Test user_has_org_permission function performance
-- Note: Replace with actual user_id and permission_key for testing
EXPLAIN (ANALYZE, BUFFERS) 
SELECT user_has_org_permission(
  '00000000-0000-0000-0000-000000000000'::uuid, 
  'can_create_events'
);

-- ============================================================================
-- 7. Identify Missing Indexes for Permission System
-- ============================================================================

-- Check for missing indexes on foreign keys
SELECT 
  tc.table_name,
  kcu.column_name,
  tc.constraint_name,
  tc.constraint_type,
  CASE 
    WHEN i.indexname IS NULL THEN 'MISSING INDEX'
    ELSE 'INDEX EXISTS'
  END as index_status
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN pg_indexes i 
  ON i.tablename = tc.table_name 
  AND i.indexdef ILIKE '%' || kcu.column_name || '%'
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('organization_permissions', 'profiles')
ORDER BY tc.table_name, kcu.column_name;

-- ============================================================================
-- 8. Concurrent User Simulation Analysis
-- ============================================================================

-- Simulate permission checking load for enterprise scale
-- This would typically be run with multiple concurrent connections

-- Test 1: Basic permission lookup performance
EXPLAIN (ANALYZE, BUFFERS)
SELECT p.user_id, p.role, p.org_id
FROM profiles p
WHERE p.org_id = (SELECT id FROM organizations LIMIT 1)
  AND p.role IN ('admin', 'board_member');

-- Test 2: Permission template lookup performance
EXPLAIN (ANALYZE, BUFFERS)
SELECT opt.permission_key, opt.module_name, opt.default_min_role
FROM organization_permission_templates opt
WHERE opt.module_name = 'events'
ORDER BY opt.permission_name;

-- Test 3: Custom permission override lookup
EXPLAIN (ANALYZE, BUFFERS)
SELECT op.permission_key, op.min_role_required, op.is_enabled
FROM organization_permissions op
WHERE op.org_id = (SELECT id FROM organizations LIMIT 1)
  AND op.is_enabled = true;

-- ============================================================================
-- 9. Performance Recommendations Report
-- ============================================================================

-- Generate performance recommendations
WITH permission_stats AS (
  SELECT 
    count(*) as total_permissions,
    count(DISTINCT org_id) as orgs_with_permissions,
    avg(CASE WHEN is_enabled THEN 1 ELSE 0 END) as enabled_rate
  FROM organization_permissions
),
template_stats AS (
  SELECT 
    count(*) as total_templates,
    count(DISTINCT module_name) as total_modules
  FROM organization_permission_templates
),
user_stats AS (
  SELECT 
    count(*) as total_users,
    count(DISTINCT org_id) as total_orgs,
    count(*) / NULLIF(count(DISTINCT org_id), 0) as avg_users_per_org
  FROM profiles
  WHERE org_id IS NOT NULL
)
SELECT 
  'PERMISSION SYSTEM BASELINE' as metric_type,
  json_build_object(
    'total_permission_templates', ts.total_templates,
    'total_modules', ts.total_modules,
    'total_custom_permissions', ps.total_permissions,
    'orgs_with_custom_permissions', ps.orgs_with_permissions,
    'permission_enabled_rate', round(ps.enabled_rate::numeric, 3),
    'total_users', us.total_users,
    'total_organizations', us.total_orgs,
    'avg_users_per_org', round(us.avg_users_per_org::numeric, 1)
  ) as baseline_metrics
FROM permission_stats ps, template_stats ts, user_stats us;

-- ============================================================================
-- 10. Enterprise Scale Simulation Queries
-- ============================================================================

-- Simulate enterprise-scale permission checking scenarios

-- Scenario 1: District with 50 schools, 100 users per school (5000 users)
-- Test permission checking performance at scale
EXPLAIN (ANALYZE, BUFFERS)
WITH enterprise_simulation AS (
  SELECT 
    p.user_id,
    p.org_id,
    p.role,
    opt.permission_key,
    COALESCE(op.min_role_required, opt.default_min_role) as effective_min_role,
    COALESCE(op.is_enabled, true) as is_enabled
  FROM profiles p
  CROSS JOIN organization_permission_templates opt
  LEFT JOIN organization_permissions op 
    ON op.org_id = p.org_id 
    AND op.permission_key = opt.permission_key
  WHERE p.org_id IS NOT NULL
  LIMIT 1000  -- Simulate checking 1000 permission combinations
)
SELECT count(*) as permission_checks_completed
FROM enterprise_simulation
WHERE is_enabled = true;

-- Scenario 2: Bulk permission validation for admin dashboard
EXPLAIN (ANALYZE, BUFFERS)
SELECT 
  p.user_id,
  p.first_name,
  p.last_name,
  p.role,
  count(CASE WHEN COALESCE(op.is_enabled, true) THEN 1 END) as enabled_permissions,
  count(*) as total_permissions
FROM profiles p
CROSS JOIN organization_permission_templates opt
LEFT JOIN organization_permissions op 
  ON op.org_id = p.org_id 
  AND op.permission_key = opt.permission_key
WHERE p.org_id = (SELECT id FROM organizations LIMIT 1)
GROUP BY p.user_id, p.first_name, p.last_name, p.role
LIMIT 100;

-- ============================================================================
-- PERFORMANCE ANALYSIS COMPLETE
-- ============================================================================

-- Summary: This analysis provides baseline metrics for:
-- 1. Current table structures and data distribution
-- 2. Existing index usage and effectiveness
-- 3. Query performance patterns
-- 4. Enterprise-scale simulation scenarios
-- 5. Recommendations for optimization

-- Next Steps:
-- 1. Implement recommended indexes
-- 2. Create materialized views for complex aggregations
-- 3. Add audit trail tables
-- 4. Implement caching strategies
-- 5. Set up performance monitoring
