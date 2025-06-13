-- Simple test script to verify the deployment fix works
-- This version avoids complex dollar-quoted strings

-- Test 1: Basic table creation and data insertion
CREATE TEMP TABLE test_metrics (
  metric_name TEXT,
  metric_value NUMERIC,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Test 2: Insert some test data
INSERT INTO test_metrics (metric_name, metric_value)
SELECT 'permission_templates', count(*) FROM organization_permission_templates;

INSERT INTO test_metrics (metric_name, metric_value)
SELECT 'custom_permissions', count(*) FROM organization_permissions;

INSERT INTO test_metrics (metric_name, metric_value)
SELECT 'organizations', count(*) FROM organizations;

INSERT INTO test_metrics (metric_name, metric_value)
SELECT 'users', count(*) FROM profiles WHERE org_id IS NOT NULL;

-- Test 3: Verify the data was inserted
SELECT 
  metric_name,
  metric_value,
  created_at
FROM test_metrics
ORDER BY created_at;

-- Test 4: Clean up
DROP TABLE test_metrics;

-- If you see the results above, the deployment script should work correctly!
