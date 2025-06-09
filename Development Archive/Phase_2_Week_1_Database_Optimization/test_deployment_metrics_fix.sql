-- Test script to verify the deployment_metrics table creation fix
-- Run this first to test the fix before running the full deployment

-- Test the temporary table creation and data insertion
DO $$
DECLARE
  template_count NUMERIC;
  permission_count NUMERIC;
  org_count NUMERIC;
  user_count NUMERIC;
BEGIN
  -- Drop the temp table if it exists from a previous run
  DROP TABLE IF EXISTS deployment_metrics;
  
  -- Create the temporary table
  CREATE TEMP TABLE deployment_metrics (
    metric_name TEXT,
    metric_value NUMERIC,
    metric_timestamp TIMESTAMP DEFAULT NOW()
  );
  
  RAISE NOTICE 'Created deployment_metrics temporary table successfully';
  
  -- Test inserting baseline metrics within the same block
  SELECT count(*) INTO template_count FROM organization_permission_templates;
  INSERT INTO deployment_metrics (metric_name, metric_value)
  VALUES ('test_permission_templates', template_count);

  SELECT count(*) INTO permission_count FROM organization_permissions;
  INSERT INTO deployment_metrics (metric_name, metric_value)
  VALUES ('test_custom_permissions', permission_count);

  SELECT count(*) INTO org_count FROM organizations;
  INSERT INTO deployment_metrics (metric_name, metric_value)
  VALUES ('test_organizations', org_count);

  SELECT count(*) INTO user_count FROM profiles WHERE org_id IS NOT NULL;
  INSERT INTO deployment_metrics (metric_name, metric_value)
  VALUES ('test_users', user_count);

  -- Display the results
  RAISE NOTICE 'Test metrics captured:';
  RAISE NOTICE '- Permission templates: %', template_count;
  RAISE NOTICE '- Custom permissions: %', permission_count;
  RAISE NOTICE '- Organizations: %', org_count;
  RAISE NOTICE '- Users: %', user_count;
  
  RAISE NOTICE 'Deployment metrics test completed successfully!';
  RAISE NOTICE 'The main deployment script should now work correctly.';
END $$;
