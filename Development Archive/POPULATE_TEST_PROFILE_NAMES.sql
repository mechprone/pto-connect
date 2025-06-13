-- Populate test profile names for development
-- Purpose: Add realistic names to existing profiles for testing
-- Date: June 12, 2025

BEGIN;

-- Update profiles with test names based on the test credentials
-- Using the test accounts from the knowledge base

UPDATE profiles 
SET 
  full_name = CASE 
    WHEN email = 'admin@sunsetpto.com' THEN 'Admin User'
    WHEN email = 'teacher@sunsetpto.com' THEN 'Sarah Teacher'
    WHEN email = 'parent@sunsetpto.com' THEN 'Mike Parent'
    WHEN email = 'volunteer@sunsetpto.com' THEN 'Jennifer Volunteer'
    WHEN email = 'committee@sunsetpto.com' THEN 'David Committee'
    WHEN email = 'board@sunsetpto.com' THEN 'Lisa Board'
    ELSE 'Test User ' || substring(id::text, 1, 8)
  END,
  first_name = CASE 
    WHEN email = 'admin@sunsetpto.com' THEN 'Admin'
    WHEN email = 'teacher@sunsetpto.com' THEN 'Sarah'
    WHEN email = 'parent@sunsetpto.com' THEN 'Mike'
    WHEN email = 'volunteer@sunsetpto.com' THEN 'Jennifer'
    WHEN email = 'committee@sunsetpto.com' THEN 'David'
    WHEN email = 'board@sunsetpto.com' THEN 'Lisa'
    ELSE 'User'
  END,
  last_name = CASE 
    WHEN email = 'admin@sunsetpto.com' THEN 'User'
    WHEN email = 'teacher@sunsetpto.com' THEN 'Teacher'
    WHEN email = 'parent@sunsetpto.com' THEN 'Parent'
    WHEN email = 'volunteer@sunsetpto.com' THEN 'Volunteer'
    WHEN email = 'committee@sunsetpto.com' THEN 'Committee'
    WHEN email = 'board@sunsetpto.com' THEN 'Board'
    ELSE substring(id::text, 1, 8)
  END
WHERE full_name IS NULL OR full_name = '';

-- Verify the updates
SELECT 
  id,
  email,
  full_name,
  first_name,
  last_name,
  CASE 
    WHEN first_name IS NOT NULL THEN first_name
    WHEN full_name IS NOT NULL THEN split_part(full_name, ' ', 1)
    ELSE 'User'
  END as display_first_name
FROM profiles
ORDER BY email;

COMMIT;

-- =====================================================
-- EXPECTED RESULTS
-- =====================================================

/*
After this migration, profiles should have:

admin@sunsetpto.com     → Admin User      (Admin, User)
teacher@sunsetpto.com   → Sarah Teacher   (Sarah, Teacher)  
parent@sunsetpto.com    → Mike Parent     (Mike, Parent)
volunteer@sunsetpto.com → Jennifer Volunteer (Jennifer, Volunteer)
committee@sunsetpto.com → David Committee (David, Committee)
board@sunsetpto.com     → Lisa Board      (Lisa, Board)

This enables:
- Stella greetings: "Hi Sarah!" "Welcome back, Mike!"
- Personalized emails: "Dear Jennifer,"
- Friendly dashboard: "Good morning, David!"
- Natural interactions throughout the app

TESTING:
- Login with any test account
- Reconciliation should work without "Error fetching user profile"
- Future Stella features can use first_name for personalization
*/
