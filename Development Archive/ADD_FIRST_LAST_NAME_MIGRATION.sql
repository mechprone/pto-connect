-- Add First Name and Last Name columns to profiles table
-- Purpose: Enable personalization features for Stella AI assistant
-- Date: June 12, 2025

BEGIN;

-- Add the new columns
ALTER TABLE profiles 
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT;

-- Parse existing full_name data into first_name and last_name
-- This handles common name formats
UPDATE profiles 
SET 
  first_name = CASE 
    WHEN full_name IS NOT NULL AND trim(full_name) != '' THEN
      trim(split_part(full_name, ' ', 1))
    ELSE NULL
  END,
  last_name = CASE 
    WHEN full_name IS NOT NULL AND trim(full_name) != '' AND position(' ' in full_name) > 0 THEN
      trim(substring(full_name from position(' ' in full_name) + 1))
    ELSE NULL
  END
WHERE full_name IS NOT NULL;

-- Verify the migration
SELECT 
  id,
  full_name,
  first_name,
  last_name,
  CASE 
    WHEN first_name IS NOT NULL THEN first_name
    WHEN full_name IS NOT NULL THEN split_part(full_name, ' ', 1)
    ELSE 'User'
  END as display_first_name
FROM profiles
ORDER BY created_at;

COMMIT;

-- =====================================================
-- POST-MIGRATION NOTES
-- =====================================================

/*
BENEFITS OF THIS MIGRATION:

1. PERSONALIZATION:
   - Stella can greet users: "Hi Sarah!" instead of "Hi Sarah Johnson!"
   - More natural, friendly interactions
   - Better user experience

2. FLEXIBILITY:
   - Keep full_name for display purposes
   - Use first_name for personalization
   - Use last_name for formal communications
   - Backwards compatibility maintained

3. FUTURE FEATURES:
   - Email personalization: "Dear John,"
   - Dashboard greetings: "Welcome back, Mary!"
   - Notification customization
   - Report addressing

USAGE EXAMPLES:
- Greeting: `Hello ${profile.first_name}!`
- Formal: `${profile.first_name} ${profile.last_name}`
- Display: `${profile.full_name}` (fallback)
- Casual: `${profile.first_name || profile.full_name?.split(' ')[0] || 'there'}`

MIGRATION STRATEGY:
- Existing full_name data is preserved
- New fields are populated from existing data
- No data loss occurs
- Backwards compatibility maintained
*/
