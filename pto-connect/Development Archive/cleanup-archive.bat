@echo off
echo Starting cleanup and archival process...

REM Move legacy phase documentation
move "PHASE_1B_RLS_POLICY_STANDARDIZATION.md" "Development Archive\" 2>nul
move "PHASE_1_COMPREHENSIVE_SYSTEM_ANALYSIS_AND_STRATEGY.md" "Development Archive\" 2>nul
move "PHASE_1_IMPLEMENTATION_PLAN.md" "Development Archive\" 2>nul
move "PHASE_1_MULTI_TENANT_ARCHITECTURE.md" "Development Archive\" 2>nul
move "PHASE_1_SPRINT_KICKOFF_PROMPT.md" "Development Archive\" 2>nul
move "PHASE_1_SYSTEM_AUDIT_AND_IMPLEMENTATION_PLAN.md" "Development Archive\" 2>nul
move "PHASE_1_SYSTEM_VALIDATION_REPORT.md" "Development Archive\" 2>nul
move "PHASE_1_UPDATED_SYSTEM_ANALYSIS.md" "Development Archive\" 2>nul
move "CORE_FOUNDATION_DEVELOPMENT_STRATEGY.md" "Development Archive\" 2>nul
move "STRATEGIC_ROADMAP_NEXT_PHASE.md" "Development Archive\" 2>nul

REM Move testing and monitoring files
move "aggressive-auto-repair.js" "Development Archive\" 2>nul
move "autonomous-browser-testing.js" "Development Archive\" 2>nul
move "autonomous-browser-testing.log" "Development Archive\" 2>nul
move "autonomous-comprehensive-testing.js" "Development Archive\" 2>nul
move "autonomous-production-testing.js" "Development Archive\" 2>nul
move "autonomous-repair-log.json" "Development Archive\" 2>nul
move "autonomous-repair-orchestrator.js" "Development Archive\" 2>nul
move "autonomous-test-results.json" "Development Archive\" 2>nul
move "autonomous-testing-and-repair.js" "Development Archive\" 2>nul
move "autonomous-testing-repair.log" "Development Archive\" 2>nul
move "autonomous-testing-script.js" "Development Archive\" 2>nul
move "autonomous-testing.log" "Development Archive\" 2>nul
move "browser-automation-tests.js" "Development Archive\" 2>nul
move "focused-testing-script.js" "Development Archive\" 2>nul
move "final-deployment-test.js" "Development Archive\" 2>nul
move "final-verification-monitor.js" "Development Archive\" 2>nul
move "final-verification.log" "Development Archive\" 2>nul
move "frontend-deployment-monitor.js" "Development Archive\" 2>nul
move "intelligent-auto-repair.js" "Development Archive\" 2>nul
move "overnight-testing-orchestrator.js" "Development Archive\" 2>nul
move "simple-endpoint-monitor.js" "Development Archive\" 2>nul
move "simple-monitor.js" "Development Archive\" 2>nul
move "endpoint-monitor.log" "Development Archive\" 2>nul
move "victory-test.js" "Development Archive\" 2>nul

REM Move deployment and migration files
move "RAILWAY_DEPLOYMENT_GUIDE.md" "Development Archive\" 2>nul
move "RAILWAY_DEPLOYMENT_URGENT_FIX.md" "Development Archive\" 2>nul
move "RAILWAY_FIX_CORRECTED.md" "Development Archive\" 2>nul
move "RAILWAY_FIX_IMPLEMENTATION_COMPLETE.md" "Development Archive\" 2>nul
move "RAILWAY_MIGRATION_SUMMARY.md" "Development Archive\" 2>nul
move "RAILWAY_ROLLUP_ISSUE_FINAL_FIX.md" "Development Archive\" 2>nul
move "RAILWAY_SUPABASE_SETUP_GUIDE.md" "Development Archive\" 2>nul
move "DEPLOYMENT_FIXES_REQUIRED.md" "Development Archive\" 2>nul
move "DEPLOYMENT_ISSUE_RESOLUTION_PLAN.md" "Development Archive\" 2>nul
move "DEPLOYMENT_MONITORING_STATUS.md" "Development Archive\" 2>nul
move "DEPLOYMENT_STATUS_REPORT.md" "Development Archive\" 2>nul
move "BACKEND_MIGRATION_COMPLETE.md" "Development Archive\" 2>nul
move "deploy-to-production.sh" "Development Archive\" 2>nul

REM Move database files
move "COMPLETE_DATABASE_DIAGNOSTIC_QUERIES.sql" "Development Archive\" 2>nul
move "DATABASE_TROUBLESHOOTING.md" "Development Archive\" 2>nul
move "database-cleanup-and-setup.sql" "Development Archive\" 2>nul
move "database-diagnostic-and-fix.sql" "Development Archive\" 2>nul
move "database-final-setup.sql" "Development Archive\" 2>nul
move "database-setup-complete.sql" "Development Archive\" 2>nul
move "database-setup-step-by-step.sql" "Development Archive\" 2>nul
move "SIMPLE_TABLE_CHECK.sql" "Development Archive\" 2>nul
move "SUPABASE_CURRENT_STATE_DIAGNOSTIC.sql" "Development Archive\" 2>nul
move "SUPABASE_STEP_BY_STEP_DIAGNOSTIC.sql" "Development Archive\" 2>nul

REM Move analysis and evaluation files
move "PTO_CONNECT_COMPREHENSIVE_EVALUATION_COMPLETE.md" "Development Archive\" 2>nul
move "PTO_CONNECT_COMPREHENSIVE_EVALUATION_PROMPT.md" "Development Archive\" 2>nul
move "PTO_CONNECT_COMPREHENSIVE_SYSTEM_EVALUATION_REPORT.md" "Development Archive\" 2>nul
move "PTO_CONNECT_FINAL_EVALUATION_REPORT.md" "Development Archive\" 2>nul
move "PLATFORM_ANALYSIS.md" "Development Archive\" 2>nul
move "PTO_MANAGER_COMPETITIVE_ANALYSIS_AND_ENHANCEMENT_PLAN.md" "Development Archive\" 2>nul
move "PTO_CONNECT_ARCHITECTURE_CONSOLIDATION_ANALYSIS.md" "Development Archive\" 2>nul

REM Move reports and summaries
move "AUTONOMOUS_REPAIR_REPORT.md" "Development Archive\" 2>nul
move "AUTONOMOUS_SYSTEM_ACTIVE_SUMMARY.md" "Development Archive\" 2>nul
move "AUTONOMOUS_TEST_SUMMARY.md" "Development Archive\" 2>nul
move "AUTONOMOUS_TESTING_REPORT.md" "Development Archive\" 2>nul
move "AUTONOMOUS_TESTING_RESULTS.md" "Development Archive\" 2>nul
move "FINAL_EVALUATION_STATUS_UPDATE.md" "Development Archive\" 2>nul
move "FINAL_MIGRATION_TEST_RESULTS.md" "Development Archive\" 2>nul
move "FINAL_VERIFICATION_REPORT.md" "Development Archive\" 2>nul
move "FOCUSED_TESTING_REPORT.md" "Development Archive\" 2>nul
move "ENDPOINT_MONITOR_REPORT.md" "Development Archive\" 2>nul
move "OVERNIGHT_TESTING_SUMMARY_AND_CHECKLIST.md" "Development Archive\" 2>nul

REM Move mockups and prototypes
move "admin-dashboard-mockup.html" "Development Archive\" 2>nul
move "theme-selection-mockup.html" "Development Archive\" 2>nul
move "index.html" "Development Archive\" 2>nul

REM Move archive files
move "pto-central-backend.zip" "Development Archive\" 2>nul
move "pto-frontend.zip" "Development Archive\" 2>nul
move "financemanager.pdf" "Development Archive\" 2>nul
move "PTO_Connect_Complete_MVP.docx" "Development Archive\" 2>nul
move "PTO_Connect_Complete_MVP.pdf" "Development Archive\" 2>nul
move "PTO_Connect_MVP.pdf" "Development Archive\" 2>nul
move "pto_test_users.xlsx" "Development Archive\" 2>nul

REM Move utility files
move "directory-structure.txt" "Development Archive\" 2>nul
move "project_structure_tree.txt" "Development Archive\" 2>nul
move "project_structure.txt" "Development Archive\" 2>nul
move "structure.txt" "Development Archive\" 2>nul
move "prompt.txt" "Development Archive\" 2>nul
move "setup-dev-environment.md" "Development Archive\" 2>nul

REM Move other documentation
move "AI_POWERED_WORKFLOW_SYSTEM.md" "Development Archive\" 2>nul
move "ALPINE_ROLLUP_FIX_FINAL.md" "Development Archive\" 2>nul
move "API_KEYS_SETUP_GUIDE.md" "Development Archive\" 2>nul
move "API_KEYS_STATUS_REPORT.md" "Development Archive\" 2>nul
move "API_VERIFICATION_GUIDE.md" "Development Archive\" 2>nul
move "CRITICAL_ISSUES_AND_FIXES.md" "Development Archive\" 2>nul
move "DESKTOP_FIRST_IMPLEMENTATION_PLAN.md" "Development Archive\" 2>nul
move "DOCKER_DEPLOYMENT_SOLUTION_FINAL.md" "Development Archive\" 2>nul
move "FLEXIBLE_AI_INTEGRATION_SUMMARY.md" "Development Archive\" 2>nul
move "FRONTEND_VERIFICATION_PROMPT.md" "Development Archive\" 2>nul
move "LIVE_DEPLOYMENT_GUIDE.md" "Development Archive\" 2>nul
move "MOBILE_APP_STRATEGIC_VISION.md" "Development Archive\" 2>nul
move "NEXT_PHASE_IMPLEMENTATION_PLAN.md" "Development Archive\" 2>nul
move "PTO_AI_ASSISTANT_NAME_OPTIONS.md" "Development Archive\" 2>nul
move "PTO_CONNECT_STRATEGIC_DEVELOPMENT_ROADMAP.md" "Development Archive\" 2>nul
move "STELLA_AI_ASSISTANT_IMPLEMENTATION_COMPLETE.md" "Development Archive\" 2>nul
move "TEST_USER_SETUP_GUIDE.md" "Development Archive\" 2>nul
move "WEEK1_SETUP_GUIDE.md" "Development Archive\" 2>nul

REM Move legacy folders
move "enhanced-dashboard-system" "Development Archive\" 2>nul
move "pto-connect-theme-system" "Development Archive\" 2>nul
move "PTO_CONNECT_PRODUCTION_BACKUP_2025-06-08_03-35-56" "Development Archive\" 2>nul

REM Move duplicate config files (check if they exist first)
if exist ".env" if not exist "pto-connect\.env" move ".env" "Development Archive\" 2>nul
if exist ".env.example" if not exist "pto-connect\.env.example" move ".env.example" "Development Archive\" 2>nul
if exist ".gitignore" if not exist "pto-connect\.gitignore" move ".gitignore" "Development Archive\" 2>nul
if exist ".nvmrc" if not exist "pto-connect\.nvmrc" move ".nvmrc" "Development Archive\" 2>nul
if exist "jsconfig.json" if not exist "pto-connect\jsconfig.json" move "jsconfig.json" "Development Archive\" 2>nul
if exist "nixpacks.toml" if not exist "pto-connect\nixpacks.toml" move "nixpacks.toml" "Development Archive\" 2>nul
if exist "package.json" if not exist "pto-connect\package.json" move "package.json" "Development Archive\" 2>nul
if exist "package-lock.json" if not exist "pto-connect\package-lock.json" move "package-lock.json" "Development Archive\" 2>nul
if exist "postcss.config.js" if not exist "pto-connect\postcss.config.js" move "postcss.config.js" "Development Archive\" 2>nul
if exist "railway.json" if not exist "pto-connect\railway.json" move "railway.json" "Development Archive\" 2>nul
if exist "tailwind.config.js" if not exist "pto-connect\tailwind.config.js" move "tailwind.config.js" "Development Archive\" 2>nul
if exist "vite.config.js" if not exist "pto-connect\vite.config.js" move "vite.config.js" "Development Archive\" 2>nul

REM Move accidentally created folders
if exist "config" if not exist "pto-connect\config" move "config" "Development Archive\" 2>nul
if exist "database" if not exist "pto-connect\database" move "database" "Development Archive\" 2>nul
if exist "docker" if not exist "pto-connect\docker" move "docker" "Development Archive\" 2>nul
if exist "docs" if not exist "pto-connect\docs" move "docs" "Development Archive\" 2>nul
if exist "scripts" if not exist "pto-connect\scripts" move "scripts" "Development Archive\" 2>nul
if exist "src" if not exist "pto-connect\src" move "src" "Development Archive\" 2>nul

echo Cleanup complete! Files moved to Development Archive.
