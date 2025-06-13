-- Verify Treasurer/Board Member access to reconciliation feature
-- Check current test users and their roles

-- Check current profiles and their roles
SELECT 
    'Current test user profiles:' as info,
    email,
    role,
    org_id,
    approved
FROM profiles 
WHERE email LIKE '%@sunsetpto.com'
ORDER BY email;

-- Check if we have a specific treasurer role
SELECT 
    'Checking for treasurer role:' as info,
    COUNT(*) as treasurer_count
FROM profiles 
WHERE role ILIKE '%treasurer%' 
   OR role ILIKE '%board%'
   OR email = 'board@sunsetpto.com';

-- Verify board member has appropriate access
SELECT 
    'Board member details:' as info,
    id,
    email,
    role,
    org_id,
    approved,
    created_at
FROM profiles 
WHERE email = 'board@sunsetpto.com';

-- Add a specific Treasurer test account if needed
INSERT INTO profiles (
    id,
    email,
    first_name,
    last_name,
    role,
    org_id,
    approved
) 
SELECT 
    gen_random_uuid(),
    'treasurer@sunsetpto.com',
    'Test',
    'Treasurer',
    'treasurer',
    org_id,
    true
FROM profiles 
WHERE email = 'admin@sunsetpto.com'
ON CONFLICT (email) DO UPDATE SET
    role = 'treasurer',
    approved = true;

-- Verify the treasurer account
SELECT 
    'Treasurer account verification:' as info,
    id,
    email,
    role,
    org_id,
    approved
FROM profiles 
WHERE email = 'treasurer@sunsetpto.com';

-- Show all financial-related roles
SELECT 
    'All financial access roles:' as info,
    email,
    role,
    CASE 
        WHEN role IN ('admin', 'treasurer', 'board_member', 'board') THEN 'Full Budget Access'
        WHEN role IN ('committee_lead', 'committee') THEN 'Limited Budget Access'
        ELSE 'No Budget Access'
    END as budget_access_level
FROM profiles 
WHERE email LIKE '%@sunsetpto.com'
ORDER BY 
    CASE 
        WHEN role IN ('admin', 'treasurer', 'board_member', 'board') THEN 1
        WHEN role IN ('committee_lead', 'committee') THEN 2
        ELSE 3
    END,
    email;

SELECT 'Treasurer access verification complete!' as status;
